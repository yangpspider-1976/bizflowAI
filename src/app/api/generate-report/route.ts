import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import { SCORE_AREAS } from '@/lib/scoring'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { clientId, language, reportType } = await request.json()
    if (!clientId) return NextResponse.json({ error: 'clientId is required' }, { status: 400 })

    const [{ data: client }, { data: score }] = await Promise.all([
      supabase.from('clients').select('*').eq('id', clientId).single(),
      supabase.from('audit_scores').select('*').eq('client_id', clientId).single(),
    ])

    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    if (!score) return NextResponse.json({ error: 'Audit scores not found. Please complete the audit first.' }, { status: 400 })

    if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const clientData = `
Business Name: ${client.business_name}
Industry: ${client.industry || 'N/A'}
Location: ${client.location || 'N/A'}
Business Type: ${client.business_type || 'N/A'}
Main Product/Service: ${client.main_product_service || 'N/A'}
Target Customers: ${(client.target_customers || []).join(', ') || 'N/A'}
Current Marketing Goal: ${client.current_marketing_goal || 'N/A'}
Main Challenge: ${client.main_challenge || 'N/A'}
Online Channels:
  - Facebook: ${client.facebook_url || 'N/A'}
  - Instagram: ${client.instagram_url || 'N/A'}
  - Google Maps: ${client.google_maps_url || 'N/A'}
  - Website: ${client.website_url || 'N/A'}
`

    const auditScores = SCORE_AREAS.map(area =>
      `${area.label}: ${score[area.key as keyof typeof score]}/${area.max}`
    ).join('\n') + `\nTotal Score: ${score.total_score}/100\nGrade: ${score.grade}`

    const operatorObservations = `
SNS Observation: ${score.sns_observation || 'N/A'}
Content Observation: ${score.content_observation || 'N/A'}
Google Maps Observation: ${score.google_maps_observation || 'N/A'}
Website/Landing Observation: ${score.website_landing_observation || 'N/A'}
Ad Readiness Observation: ${score.ad_readiness_observation || 'N/A'}
Inquiry Flow Observation: ${score.inquiry_flow_observation || 'N/A'}
Competitor Observation: ${score.competitor_observation || 'N/A'}
Key Strengths: ${score.key_strengths || 'N/A'}
Key Weaknesses: ${score.key_weaknesses || 'N/A'}
`

    let prompt: string
    if (language === 'ko') {
      prompt = `You are a professional marketing audit consultant for BizFlow AI.
BizFlow AI is an AI-powered marketing audit and growth automation service for Korean-owned businesses and small businesses in the Philippines.
Write a Korean client-ready "BizFlow AI 무료 마케팅 진단 리포트" based on the client data and audit scores below.

Rules:
1. Write in Korean.
2. Use a professional and practical tone.
3. Do not criticize the client harshly.
4. Focus on improvement opportunities.
5. Do not guarantee sales, advertising performance, or customer acquisition.
6. Explain the score as a "마케팅 운영 준비도 점수."
7. This is a free report, so do not include deep ad strategy or detailed competitor analysis.
8. Include a practical 7-day action plan.
9. End with a soft recommendation for the next BizFlow AI service.
10. Include this disclaimer:
"본 진단은 입력된 정보와 공개적으로 확인 가능한 온라인 채널을 기준으로 작성된 마케팅 운영 준비도 분석입니다. 본 리포트는 매출 증가, 광고 성과, 고객 유입 증가를 보장하지 않으며, 실제 성과는 업종, 예산, 운영 방식, 시장 상황, 경쟁 환경에 따라 달라질 수 있습니다."

Report structure:
# BizFlow AI 무료 마케팅 진단 리포트
## Page 1. Cover Page
## Page 2. Executive Summary + Overall Score
## Page 3. Key Findings
## Page 4. 7-Day Quick Action Plan
## Page 5. Recommended Next Step

Client Data:
${clientData}

Audit Scores:
${auditScores}

Operator Observations:
${operatorObservations}

Recommended Package:
${score.recommended_package}`
    } else {
      prompt = `You are a professional marketing audit consultant for BizFlow AI.
BizFlow AI is an AI-powered marketing audit and growth automation service for Korean-owned businesses and small businesses in the Philippines.
Write an English client-ready "BizFlow AI Free Marketing Audit Report" based on the client data and audit scores below.

Rules:
1. Write in English.
2. Use a professional and practical tone.
3. Do not criticize the client harshly.
4. Focus on improvement opportunities.
5. Do not guarantee sales, advertising performance, or customer acquisition.
6. Explain the score as a "marketing operational readiness score."
7. This is a free report, so do not include deep ad strategy or detailed competitor analysis.
8. Include a practical 7-day action plan.
9. End with a soft recommendation for the next BizFlow AI service.
10. Include this disclaimer:
"This audit is a marketing operational readiness analysis based on the submitted information and publicly available online channels. This report does not guarantee sales growth, advertising performance, or customer acquisition results. Actual outcomes may vary depending on industry, budget, execution, market conditions, and competition."

Report structure:
# BizFlow AI Free Marketing Audit Report
## Page 1. Cover Page
## Page 2. Executive Summary + Overall Score
## Page 3. Key Findings
## Page 4. 7-Day Quick Action Plan
## Page 5. Recommended Next Step

Client Data:
${clientData}

Audit Scores:
${auditScores}

Operator Observations:
${operatorObservations}

Recommended Package:
${score.recommended_package}`
    }

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4000,
    })

    const content = completion.choices[0]?.message?.content || ''
    const title = language === 'ko'
      ? `BizFlow AI 무료 마케팅 진단 리포트 - ${client.business_name}`
      : `BizFlow AI Free Marketing Audit Report - ${client.business_name}`

    const { data: reportData, error: reportError } = await supabase.from('reports').insert({
      client_id: clientId,
      report_type: reportType || 'free',
      language,
      status: 'Generated',
      title,
      content_markdown: content,
      created_by: user.email,
    }).select('id').single()

    if (reportError) return NextResponse.json({ error: reportError.message }, { status: 500 })

    await supabase.from('clients').update({ lead_status: 'Report Generated', updated_at: new Date().toISOString() }).eq('id', clientId)

    return NextResponse.json({ reportId: reportData.id, content })
  } catch (error: any) {
    console.error('Report generation error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
