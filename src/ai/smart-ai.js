export function analyzeServiceWithAi(inputText = "") {
  const text = inputText.toLowerCase();

  let category = "General";
  if (text.includes("ac") || text.includes("এসি") || text.includes("cool")) category = "AC";
  else if (text.includes("elect") || text.includes("wire") || text.includes("বিদ্যুৎ") || text.includes("কারেন্ট")) category = "Electrical";
  else if (text.includes("plumb") || text.includes("pipe") || text.includes("পানি") || text.includes("প্লাম্বার")) category = "Plumbing";
  else if (text.includes("wood") || text.includes("door") || text.includes("কার্পেন্টার")) category = "Carpenter";
  else if (text.includes("paint") || text.includes("রং")) category = "Painter";

  const isEmergency =
    text.includes("urgent") ||
    text.includes("emergency") ||
    text.includes("জরুরি") ||
    text.includes("leak") ||
    text.includes("spark") ||
    text.includes("night");

  const suggestedMessage = isEmergency
    ? `Emergency ${category} help needed: ${inputText}. Let's discuss details & fair rate on WhatsApp.`
    : `Looking for ${category} service: ${inputText}. Can we discuss timing & deal on WhatsApp?`;

  return { category, isEmergency, suggestedMessage };
}
