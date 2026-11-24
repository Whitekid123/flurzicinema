# Original demo artwork

All five images were generated for this project using the built-in OpenAI image generation tool. They illustrate fictional films and do not represent real productions, release schedules or licensed streaming availability.

| Asset | Art direction |
| --- | --- |
| quiet-beyond | Lone traveler, basalt coastline, amber eclipse |
| last-train | Red train crossing an alpine viaduct |
| velvet-hours | Red-lit rain, narrow city street, lone traveler |
| tides | Moonlit teal sea and solitary sailboat |
| afterlight | Terracotta desert and the last light |

WebP files are the runtime assets. PNG files retain the original generated compositions. Film titles are overlaid as HTML so they remain readable and adaptable. Replace the paths in `data/movies.ts` when a licensed production catalog is supplied. No reference-site art or third-party commercial posters are used.

Additional original generated scenes for the motion follow-up: hero/quiet-cave, hero/train-carriage and hero/velvet-translator (PNG masters, optimized WebP). Each belongs only to its named fictional title; lib/heroArtwork.ts refuses these variants for real catalog records. Built-in image_gen prompt set: docs/MOTION_ARTWORK_PROMPTS.json.
