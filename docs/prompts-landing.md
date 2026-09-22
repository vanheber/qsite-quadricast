# Prompts de Imagem — Landing Quadricast

> Gerados pela metodologia do plugin **prompt-imagem** do QMIND (modo SOMENTE IMAGEM)
> + design system Quadricast (qmind/clients/quadricast/estrategia.md).
> Todas as imagens são **fotografia pura** (sem texto sobreposto — o copy é renderizado pelo HTML).
> Proporções (`--ar`) seguem os placeholders atuais em `src/site/assets/img/`.

---

## Design System Quadricast (repetido em cada prompt)

- **Arquétipo:** Criador + Arquiteto → manifestações visuais: equipamento em ação, switcher, waveform, timecode, grids técnicos. NUNCA citar "arquétipo".
- **Cores:** dark `#04162B` (fundo), azul royal `#0762C8` (acento), aqua neon `#9BC31D` (segundo acento — usar UM por composição).
- **Texturas:** painéis acústicos ripados, espuma geométrica fosca, vidro escurecido, alumínio escovado.
- **Luz:** softbox grande difuso + rim light + luz motivada de monitores (fonte nomeada + dureza).
- **Câmera:** `full-frame digital cinema camera` (nunca marca), f/ explícito, profundidade rasa.
- **Presença humana:** 5–7/10 — operadores em ação, entrevistados reais, mãos com tarefa, olhar fora do quadro.
- **Blindagens:** sem buzzwords (photorealistic, stunning, 4k…), sem marcas, sem glows indigo/roxo genérico, sem emojis, sem screenshots falsos, off-black no lugar de preto puro.

---

## 1. hero-split-form-bg.webp — Fundo do Hero

**Uso:** background da seção hero (cover + overlay escuro). Área à esquerda recebe copy, direita recebe o form. Compor com espaço escuro o suficiente para texto branco renderizar por cima.
**Placeholder:** 1024×1024 (1:1).

```
Wide shot of a professional podcast and videocast studio in full operation, broadcast control room ambience, three operators working a multi-camera switcher console, operator hands adjusting faders and calling a cut, foreground acoustic wood slat panels and dark charcoal acoustic foam, deep dark navy background at #04162B with subtle vignette, large softbox diffusers casting soft even light on the left side of the frame, rim light outlining the camera operators, small warm screen glow from the switcher monitors, 35mm f/2.8 full-frame digital cinema camera, shallow depth of field with soft foreground bokeh on a studio monitor edge, composed with generous dark negative space on the left third for overlaid text, single accent of royal blue #0762C8 glowing on an equipment status light, subtle timecode readout bokeh in the far background, muted teal-black grade with natural film grain
--ar 1:1 --stylize 250
```

**Negative Prompt:** `white text, text overlay, watermark, logo, stock photo look, bright clinical lighting, cardboard studio, amateur gear, cluttered cables, lens flare, purple glow, emoji, illustration`

**Assumi:** luz softbox difusa (tom de bastidor profissional); presença humana com operadores em ação; lado esquerdo escuro reservado ao copy.
**Para variar:** troque o acento `#0762C8` por `#9BC31D`; aumente/reduza a quantidade de operadores.

---

## 2. feature-benefit-1.webp — Estúdios de Gravação

**Uso:** card de benefício (imagem de fundo com gradiente escuro no terço inferior + texto).
**Placeholder:** 400×600 (2:3, retrato).

```
Vertical composition of an empty high-end recording studio set moments before a shoot, acoustic wood slat wall panels and charcoal acoustic foam, a professional broadcast microphone on a boom arm catching soft light, two cinema cameras on tripods in the background pointed at two leather armchairs, one technician's hand placing a foam windscreen on a mic, soft large softbox key light from the upper left, subtle royal blue #0762C8 LED strip accenting the baseboard behind the furniture, deep navy shadows at #04162B in the corners, 50mm f/1.8 full-frame digital cinema camera, shallow depth of field focused on the microphone, dark gradient toward the bottom third leaving clean space for overlaid caption, muted premium teal-black grade, natural film grain
--ar 2:3 --stylize 250
```

**Negative Prompt:** `white text, watermark, logo, people posing, bright clinical lighting, cardboard studio, cluttered cables, purple glow, emoji, illustration`

**Assumi:** cenário vazio com um técnico em ação (sugere prontidão e rigour); botão de texto cobre o terço inferior escuro.
**Para variar:** troque o acento por `#9BC31D`; inclua um entrevistado na cadeira.

---

## 3. feature-benefit-2.webp — Podcasts & Videocasts

**Uso:** card de benefício (imagem de fundo + gradiente no terço inferior).
**Placeholder:** 400×600 (2:3, retrato).

```
Vertical editorial shot of a broadcast videocast interview in progress, two hosts seated at a dark wood table with professional microphones, a male executive in his forties in a relaxed charcoal blazer gesturing mid-conversation, gaze directed at the other host not at camera, visible natural skin texture and micro wrinkles, soft window-style softbox key light from camera left, rim light separating the host's shoulders, two cinema cameras visible in soft focus background, wall of acoustic wood slat panels, deep navy #04162B shadows, subtle royal blue #0762C8 glow from a teleprompter screen in the background, 85mm f/1.8 full-frame digital cinema camera, creamy background blur, dark lower third with clean space for caption, muted contrast editorial grade, natural film grain
--ar 2:3 --stylize 250
```

**Negative Prompt:** `white text, watermark, logo, posing for camera, stiff handshake, bright office lighting, cardboard studio, cluttered cables, purple glow, emoji, illustration`

**Assumi:** conversa ao vivo autêntica (hosts olhando entre si); acento azul no teleprompter.
**Para variar:** troque por dupla feminina; troque acento por `#9BC31D`.

---

## 4. feature-benefit-3.webp — Produção Audiovisual

**Uso:** card de benefício (imagem de fundo + gradiente no terço inferior).
**Placeholder:** 400×600 (2:3, retrato).

```
Vertical shot of a film editor working a post-production suite, editor's hands on a trackpad and keyboard over a timeline full of video clips, eyes down focused on the monitor, face lit by the monitor glow, visible skin texture and fine surface lines, brushed aluminum paneling and dark acoustic foam on the walls, a secondary monitor showing a color grading interface, deep navy #04162B ambient shadow, single accent of aqua neon #9BC31D on an editing marker on the screen, soft diffuse overhead light mixing with cool monitor light, 50mm f/1.8 full-frame digital cinema camera, shallow depth of field on the hands, dark lower third reserved for overlaid caption, muted cinematic grade, natural film grain
--ar 2:3 --stylize 250
```

**Negative Prompt:** `white text, watermark, logo, fake dashboard metrics, invented charts, posing, bright clinical lighting, purple glow, emoji, illustration`

**Assumi:** editor real em ação (mãos com tarefa, olhar no monitor); interface de edição sem números fictícios.
**Para variar:** troque por um colorista ajustando curva de cor; acento `#0762C8` no monitor.

---

## 5. feature-benefit-4.webp — Eventos & Lives

**Uso:** card de benefício (imagem de fundo + gradiente no terço inferior).
**Placeholder:** 400×600 (2:3, retrato).

```
Vertical documentary shot of a mobile broadcast operation set inside a busy corporate trade fair, a compact live streaming rig on a rolling cart with a camera on a tripod and a small switcher, a technician's hand adjusting a lens ring, blurred conference floor with attendees and booth lights in the background, warm tungsten stage lights mixing with cool ambient, deep navy #04162B shadows at the frame edges, small royal blue #0762C8 status light on the streaming encoder, shallow depth of field focused on the camera body, 35mm f/2.8 full-frame digital cinema camera, natural handheld documentary feel with slight grain, dark lower third with clean space for caption
--ar 2:3 --stylize 250
```

**Negative Prompt:** `white text, watermark, logo, posed smile, static office, cardboard studio, cluttered cables, purple glow, emoji, illustration`

**Assumi:** estúdio móvel em feira (itinerância da marca); energia de evento ao vivo.
**Para variar:** troque feira por congresso com palco ao fundo; acento `#9BC31D`.

---

## 6. feature-tab-1.webp — Podcasts & Videocasts (aba)

**Uso:** imagem lateral da aba "Podcasts & Videocasts" (multicâmera 4K).
**Placeholder:** 600×400 (3:2, paisagem).

```
Wide editorial shot of a multi-camera videocast set in full swing, a host speaking to another guest across a dark wood table, three cinema cameras on tripods visible in frame at different angles, softbox key light from the left and a rim light behind the hosts, wall of acoustic wood slat panels, teleprompter glowing softly, deep navy #04162B shadows, subtle royal blue #0762C8 accent on a studio LED panel, host in a navy blazer mid-gesture with hands explaining, natural skin texture, 35mm f/2.8 full-frame digital cinema camera, shallow depth of field on the foreground host, muted contrast editorial grade, natural film grain
--ar 3:2 --stylize 250
```

**Negative Prompt:** `white text, watermark, logo, posing at camera, stiff presentation, bright clinical lighting, cardboard studio, purple glow, emoji, illustration`

**Assumi:** multicâmera visível como prova técnica; host gesticulando naturalmente.
**Para variar:** troque o acento por `#9BC31D`; torne as duas pessoas mulheres.

---

## 7. feature-tab-2.webp — Estúdio Gastronômico (aba)

**Uso:** imagem lateral da aba "Estúdio Gastronômico" (cozinha cenográfica).
**Placeholder:** 600×400 (3:2, paisagem).

```
Editorial shot of a professional culinary studio set, chef in a dark apron plating a dish on a brushed steel counter, hands carefully placing a garnish with tweezers, overhead soft daylight-style panel lighting that makes fresh herbs and ingredients glow, dark navy #04162B backdrop walls with subtle charcoal acoustic panels, water station and prep counter visible in the blurred background, a cinema camera in soft focus foreground, single accent of aqua neon #9BC31D on a fresh herb garnish, shallow depth of field on the chef's hands, 50mm f/1.8 full-frame digital cinema camera, steam rising from the dish catching the light, muted editorial grade, natural film grain
--ar 3:2 --stylize 250
```

**Negative Prompt:** `white text, watermark, logo, fast food, dirty kitchen, harsh fluorescent light, cardboard studio, purple glow, emoji, illustration`

**Assumi:** chef real em ação com mão em tarefa (plating); luz zenital sobre ingredientes como a estratégia pede.
**Para variar:** troque o acento por `#0762C8`; inclua degustação à mesa.

---

## 8. feature-tab-3.webp — Vídeos, Cursos & Corporativo (aba)

**Uso:** imagem lateral da aba "Vídeos, Cursos & Corporativo" (set modular).
**Placeholder:** 600×400 (3:2, paisagem).

```
Editorial shot of a versatile corporate video set configured for a masterclass, an instructor in a smart casual outfit standing beside a minimalist presentation monitor, pointing at the screen while speaking, teleprompter visible, deep navy #04162B backdrop with subtle grid texture, soft key light from the left and gentle rim light, acoustic panel wall in the background, small royal blue #0762C8 accent on a studio light stand, shallow depth of field on the instructor, natural skin texture and mid-gesture hand, 35mm f/2.8 full-frame digital cinema camera, clean modular composition, muted professional grade, natural film grain
--ar 3:2 --stylize 250
```

**Negative Prompt:** `white text, watermark, logo, fake presentation charts, empty auditorium, bright clinical lighting, cardboard studio, purple glow, emoji, illustration`

**Assumi:** set corporativo modular (mesmo ambiente, nova linguagem); instructor real em ação.
**Para variar:** troque acento por `#9BC31D`; cenário com dois monitores.

---

## 9. bento-1.webp — O Ativo Central / Episódio Master (large)

**Uso:** célula "large" do bento-grid (imagem à esquerda, conteúdo à direita sobre fundo primário).
**Placeholder:** 400×400 (1:1).

```
Square editorial shot of a recording studio in the middle of a live take, RED-style cinema camera silhouette on a tripod in the foreground with a camera operator behind it, hands steadying the lens, a host speaking at a microphone in the background, control room window reflecting operators at a switcher, large softbox creating soft key light with a subtle royal blue #0762C8 gel accent on a back wall panel, deep navy #04162B shadows, acoustic wood slat walls, shallow depth of field on the foreground camera, 35mm f/2.8 full-frame digital cinema camera, composition with strong diagonal leading lines, muted teal-black grade, natural film grain
--ar 1:1 --stylize 250
```

**Negative Prompt:** `white text, watermark, logo, posing, cardboard studio, cluttered cables, purple glow, emoji, illustration`

**Assumi:** câmera como protagonista (o "ativo central"); operador em ação.
**Para variar:** troque o gel por `#9BC31D`; aproxime o enquadramento do host.

---

## 10. bento-2.webp — Cortes Verticais de Alta Retenção

**Uso:** célula do bento-grid (imagem + conteúdo lateral).
**Placeholder:** 400×400 (1:1).

```
Square shot of a post-production editing suite with a large monitor showing a 9:16 vertical video timeline with waveform and caption track, editor's hand on a trackpad adjusting a cut, monitor glow as the main light source, brushed aluminum desk and dark acoustic foam wall, deep navy #04162B ambient, subtle aqua neon #9BC31D marker on the timeline, second small monitor with a waveform in soft focus, shallow depth of field on the hand, 50mm f/1.8 full-frame digital cinema camera, dark modern grade with clean lower area, natural film grain
--ar 1:1 --stylize 250
```

**Negative Prompt:** `white text, watermark, logo, fake metrics, invented analytics, cardboard studio, purple glow, emoji, illustration`

**Assumi:** timeline vertical 9:16 sem números fictícios; mão em tarefa de edição.
**Para variar:** troque acento por `#0762C8`; mostra apenas a timeline sem mão.

---

## 11. bento-3.webp — Insights para LinkedIn & Negócios

**Uso:** célula do bento-grid (imagem + conteúdo lateral).
**Placeholder:** 400×400 (1:1).

```
Square editorial portrait of a confident business leader mid-interview in a studio, man in his forties in a navy blazer speaking to an off-camera interviewer, gaze directed out of frame toward the interviewer, natural skin texture with fine lines, hands engaged in an explaining gesture, softbox key light with a subtle rim light, deep navy #04162B background with soft acoustic panel texture, small royal blue #0762C8 accent light on the background wall, shallow depth of field, 85mm f/1.8 full-frame digital cinema camera, authoritative editorial mood, muted premium grade, natural film grain
--ar 1:1 --stylize 250
```

**Negative Prompt:** `white text, watermark, logo, stiff corporate pose, fake office, bright clinical lighting, cardboard studio, purple glow, emoji, illustration`

**Assumi:** liderança executiva em fala de autoridade (não olhando para câmera); acento azul.
**Para variar:** troque para executiva mulher; acento `#9BC31D`.

---

## 12. bento-4.webp — Cobertura de Bastidores e Fotos

**Uso:** célula do bento-grid (imagem + conteúdo lateral).
**Placeholder:** 400×400 (1:1).

```
Square documentary shot of backstage production on a studio set, a photographer's hand holding a mirrorless camera capturing the scene, blurred background with a lighting crew adjusting a softbox and a boom operator positioning a microphone, deep navy #04162B shadows with warm practical light, small aqua neon #9BC31D accent on a pocket light in frame, shallow depth of field on the foreground camera, candid unposed moment, 35mm f/2.8 full-frame digital cinema camera, natural documentary grain, dark moody grade
--ar 1:1 --stylize 250
```

**Negative Prompt:** `white text, watermark, logo, posed team photo, bright clinical lighting, cardboard studio, cluttered cables, purple glow, emoji, illustration`

**Assumi:** bastidor autêntico (fotógrafo registrando o set); prova de solidez da operação.
**Para variar:** troque o acento por `#0762C8`; enquadre o set de gastronomia.

---

## (Opcional) og-image.webp — Imagem de Compartilhamento (Open Graph)

**Uso:** `{{og_image}}` da home (compartilhamento em redes). **Recomendado gerar em 1200×630 (1.91:1)** — o placeholder atual é 150×150, pequeno demais para OG.
**Placeholder:** 150×150.

```
Wide horizontal shot of a professional broadcast studio control room, camera operator behind a cinema camera, switcher console with glowing faders in the foreground, acoustic panel walls, deep navy #04162B ambience with a single royal blue #0762C8 accent light, softbox key lighting, 35mm f/2.8 full-frame digital cinema camera, clean composition with dark left side for any overlay, muted premium grade, natural film grain
--ar 1200:630 --stylize 250
```

**Negative Prompt:** `white text, watermark, logo, posing, cardboard studio, purple glow, emoji, illustration`

**Assumi:** mesma família visual do hero; lado escuro reservado ao title do OG.
**Para variar:** use o quadro do bento-1 (episódio master) como base.

---

## Checklist de produção

- [ ] Gerar com a proporção do placeholder (ou o `--ar` indicado quando recomendado — ex: og-image).
- [ ] Upscale no Magnific mantendo a proporção.
- [ ] Salvar em `src/site/assets/img/<nome>.webp` (WebP).
- [ ] Manter o design system: fundo `#04162B`, UM acento por imagem (`#0762C8` ou `#9BC31D`).
- [ ] Nenhuma imagem com texto/logo — o copy é renderizado pelo HTML.