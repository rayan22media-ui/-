

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


export const getBarterSuggestion = async (title: string, category: string, description: string): Promise<string> => {
  try {
    const prompt = `
      أنا أعرض غرضًا للمقايضة في تطبيق سوري. أريد اقتراحات قصيرة ومناسبة لما يمكنني أن أطلبه في المقابل.
      
      تفاصيل الغرض:
      - العنوان: ${title}
      - الفئة: ${category}
      - الوصف: ${description}

      اقترح 3 أشياء يمكن أن تكون مقايضة جيدة لهذا الغرض في سياق السوق السوري. قدم الاقتراحات كقائمة قصيرة ومباشرة باللغة العربية.
      مثال على الرد:
      - هاتف ذكي من الفئة المتوسطة
      - جهاز لوحي (تابلت) بحالة جيدة
      - مبلغ مالي يتم الاتفاق عليه
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error fetching Gemini suggestion:", error);
    return "حدث خطأ أثناء جلب الاقتراح. يرجى المحاولة مرة أخرى.";
  }
};
