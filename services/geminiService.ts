import { GoogleGenAI } from "@google/genai";

// Lazy initialization of the AI client
let ai: GoogleGenAI | null = null;

function getAiInstance(): GoogleGenAI | null {
  if (ai) {
    return ai;
  }
  
  // Read the Gemini API key from the global __ENV__ object.
  const apiKey = window.__ENV__?.VITE_API_KEY;
  
  // Check if the API key is present.
  if (apiKey) {
    try {
      ai = new GoogleGenAI({ apiKey });
      return ai;
    } catch (e) {
        console.error("Failed to initialize GoogleGenAI:", e);
        return null;
    }
  }
  
  console.warn("Gemini API key (VITE_API_KEY) is not configured in your .env file. AI features will be disabled.");
  return null;
}


export const getBarterSuggestion = async (title: string, category: string, description: string): Promise<string> => {
  const aiInstance = getAiInstance();
  if (!aiInstance) {
    return "ميزة الاقتراحات غير متاحة حالياً بسبب مشكلة في الإعدادات.";
  }
    
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

    const response = await aiInstance.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error fetching Gemini suggestion:", error);
    return "حدث خطأ أثناء جلب الاقتراح. يرجى المحاولة مرة أخرى.";
  }
};