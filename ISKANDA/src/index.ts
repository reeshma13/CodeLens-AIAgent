import { ExplainAgent } from "./agent/explainAgent";

async function main() {
  const iskanda = new ExplainAgent();
const path = require('path');

const projectPath = "C:\\Users\\Thatikonda.SaiLakshm\\Documents\\GitHub\\uniqual_sqmweb_React\\src";
  // 👇 Change this path to ANY project folder you want!
  await iskanda.ingest(projectPath);

  // 👇 Ask anything about the codebase
  const answer1 = await iskanda.ask("how does it work?");
  console.log(`\n🔱 ISKANDA:\n${answer1}`);

  const answer2 = await iskanda.ask("how does authentication and signin/login work?");
  console.log(`\n🔱 ISKANDA:\n${answer2}`);

  const answer3 = await iskanda.ask("what does this project do");
  console.log(`\n🔱 ISKANDA:\n${answer3}`);
}

main();