import fs from "node:fs/promises";
const refs = JSON.parse(
  await fs.readFile("docs/reference-captures.json", "utf8"),
);
await Promise.allSettled(
  refs.map(async (ref) => {
    const response = await fetch(ref.screenshot);
    if (!response.ok) throw new Error(`${ref.i}: ${response.status}`);
    await fs.writeFile(
      `docs/reference-${ref.i}.png`,
      Buffer.from(await response.arrayBuffer()),
    );
    console.log(`Saved reference ${ref.i}`);
  }),
);
