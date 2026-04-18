import { NextRequest, NextResponse } from 'next/server';

const GEMINI_PROMPT = `أنت محلل فواتير وعروض أسعار محترف. استخرج البيانات التالية من الصورة/المستند المرفق وأرجعها بصيغة JSON فقط بدون أي نص إضافي:

{
  "company_name": "اسم الشركة المصدرة",
  "company_tax": "الرقم الضريبي للشركة إن وجد",
  "quotation_number": "رقم العرض أو الفاتورة",
  "date": "التاريخ بصيغة YYYY-MM-DD",
  "customer_name": "اسم العميل إن وجد",
  "items": [
    {
      "name": "اسم الصنف/الخدمة",
      "qty": 1,
      "price": 0,
      "total": 0
    }
  ],
  "subtotal": 0,
  "tax_rate": 15,
  "tax_amount": 0,
  "total": 0,
  "notes": "أي ملاحظات أو شروط مذكورة",
  "confidence": 95
}

قواعد مهمة:
- أرجع JSON فقط بدون markdown أو backticks
- إذا لم تجد قيمة اتركها فارغة أو 0
- الأسعار بالأرقام فقط بدون رمز العملة
- إذا كان المستند غير واضح، ضع confidence أقل من 70
- استخرج كل البنود الموجودة في الجدول`;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const clientApiKey = formData.get('apiKey') as string;
    
    // Use server env key first, fallback to client-provided key
    const apiKey = process.env.GEMINI_API_KEY || clientApiKey;
    
    if (!file) {
      return NextResponse.json({ error: 'لم يتم رفع ملف' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'مفتاح API مطلوب. أضفه في ملف .env.local' }, { status: 400 });
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    
    // Determine MIME type
    const mimeType = file.type || 'image/jpeg';

    // Call Gemini Vision API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: GEMINI_PROMPT },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 4096,
        }
      })
    });

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.text();
      console.error('Gemini API Error:', errorData);
      let parsedMessage = errorData;
      try {
        const parsed = JSON.parse(errorData);
        parsedMessage = parsed.error?.message || errorData;
      } catch (e) {}
      return NextResponse.json({ 
        error: `خطأ من جوجل: ${parsedMessage}` 
      }, { status: 500 });
    }

    const geminiData = await geminiResponse.json();
    
    // Extract text from response
    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!responseText) {
      return NextResponse.json({ error: 'لم يتم استخراج أي بيانات من الملف' }, { status: 500 });
    }

    // Parse JSON from response (handle potential markdown wrapping)
    let extractedData;
    try {
      // Remove markdown code blocks if present
      const cleanJson = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      extractedData = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error('JSON Parse Error:', responseText);
      return NextResponse.json({ 
        error: 'فشل في تحليل البيانات المستخرجة',
        raw: responseText 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: extractedData,
      fileName: file.name,
      fileSize: file.size
    });

  } catch (error: any) {
    console.error('AI Extract Error:', error);
    return NextResponse.json({ 
      error: error.message || 'حدث خطأ غير متوقع' 
    }, { status: 500 });
  }
}
