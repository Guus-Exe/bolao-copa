import { readFileSync } from "fs";
import { extractTextFromPDF, extractGamesFromText } from "./lib/pdf-game-extractor";

async function main() {
  const filePath = "c:\\Users\\gusta\\OneDrive\\Área de Trabalho\\bolao\\Resultados e Calendários da Copa do Mundo _ FBref.com.pdf";
  const buffer = readFileSync(filePath);
  const text = await extractTextFromPDF(buffer.buffer);
  
  const { games, warnings } = extractGamesFromText(text);

  console.log(`\nFound ${games.length} games.`);
  if (games.length > 0) {
    console.log("First 3 games:", games.slice(0, 3));
  }
  
  console.log(`\nWarnings (${warnings.length}):`);
  warnings.slice(0, 10).forEach(w => console.log(w));
}

main().catch(console.error);
