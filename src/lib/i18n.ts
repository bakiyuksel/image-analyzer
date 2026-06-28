export type Lang = 'nl' | 'en'

export const translations = {
  nl: {
    app: {
      subtitle: 'Upload een foto om alle views te genereren',
      newImage: 'Nieuwe afbeelding',
      loading: 'Views genereren…',
    },
    dropzone: {
      headline: 'Sleep een afbeelding hierheen',
      hint: 'of plak (Ctrl+V) — JPG, PNG, WebP, AVIF',
      uploadButton: 'Bladeren',
      urlButton: 'URL plakken',
    },
    urlModal: {
      title: 'Afbeelding-URL',
      placeholder: 'https://…',
      load: 'Laden',
      cancel: 'Annuleren',
      errorNotImage: 'Dit lijkt geen directe afbeelding-URL. Rechts-klik op de afbeelding → "Afbeelding-adres kopiëren".',
      errorFailed: 'Kon de afbeelding niet ophalen. Controleer of de URL nog geldig is.',
    },
    lightbox: {
      close: 'Sluiten (Escape)',
      zoomHint: 'Scroll om in te zoomen · Sleep om te pannen',
      reset: 'reset',
    },
    prediction: {
      heading: 'Analyse',
      elaHighTitle: 'Hoge ELA-afwijking',
      elaHighDetail: (score: string) =>
        `Score: ${score}% — Meerdere zones reageren significant anders op JPEG re-compressie dan de omgeving. Dit is een sterke indicator van copy-paste, lokale retouche of compositing. Bekijk de ELA-view op heldere vlekken.`,
      elaWarnTitle: 'Matige ELA-afwijking',
      elaWarnDetail: (score: string) =>
        `Score: ${score}% — Lichte JPEG-compressie-inconsistenties aanwezig. Kan duiden op lichte bewerkingen, meerdere opslagrondes of zwaar bijgesneden gebieden.`,
      noiseHighTitle: 'Sterk wisselend ruispatroon',
      noiseHighDetail: (score: string) =>
        `Score: ${score}% — Het ruisniveau varieert significant tussen gebieden. Kloonstempels, inpainting of ingeplakte elementen van een andere camera missen de organische ruis van de rest van de foto.`,
      noiseWarnTitle: 'Wisselend ruispatroon',
      noiseWarnDetail: (score: string) =>
        `Score: ${score}% — Lichte inconsistentie in het ruispatroon. Kan wijzen op zachte retouche, content-aware fill of sterk verschil in scherpte tussen gebieden.`,
      sobelWarnTitle: 'Opvallend veel scherpe randen',
      sobelWarnDetail: (score: string) =>
        `Score: ${score}% — Hoge gemiddelde randsterkte. Controleer de Edge Detection-view op halo's of te strak uitgesneden objecten die wijzen op compositing.`,
      okTitle: 'Geen duidelijke manipulatie-indicatoren',
      okDetail: 'De geanalyseerde metrics tonen geen sterke tekenen van bewerking. Dit sluit manipulatie niet uit — beoordeel de views ook visueel, met name ELA en Noise Map.',
    },
    histogram: {
      heading: 'RGB Histogram',
      red: 'Rood',
      green: 'Groen',
      blue: 'Blauw',
      gapWarning: 'Kammen (gaps) gedetecteerd in het histogram — typisch voor levels- of curves-aanpassingen.',
    },
    exif: {
      heading: 'EXIF Metadata',
      loading: 'Metadata laden…',
      noData: 'Geen EXIF-data gevonden — foto is mogelijk gestript of nooit met een camera gemaakt.',
      softwareFlag: (sw: string) => `Software-veld bevat "${sw}" — direct bewijs dat de foto door bewerkingssoftware is gegaan.`,
      noCamera: 'Camera make/model ontbreekt — originele opnamen bevatten dit normaal altijd.',
      noOriginalDate: 'DateTimeOriginal ontbreekt maar DateTimeDigitized aanwezig — wijst op herverwerking of export.',
      noDates: 'Alle datumvelden ontbreken — gestripte EXIF of synthetisch gegenereerd beeld.',
      timelineAlert: (capture: string, file: string) => `Opnamedatum (${capture}) ligt NA bestandsdatum (${file}) — onmogelijk bij een authentiek bestand.`,
      gpsMismatch: (gps: string) => `GPS-datum (${gps}) wijkt af van opnamedatum — locatie mogelijk achteraf toegevoegd.`,
      gpsNoDate: 'GPS-coördinaten aanwezig maar GPS-datumstempel ontbreekt — inconsistente metadata.',
      thumbMismatch: 'Embedded thumbnail matcht niet met de hoofdafbeelding — klassiek teken van bewerking na export.',
      allOk: 'Geen verdachte metadata-indicatoren gevonden.',
      rowLabels: {
        make: 'Make',
        model: 'Model',
        software: 'Software',
        captureDate: 'Opnamedatum',
        digitizationDate: 'Digitalisatiedatum',
        fileDate: 'Bestandsdatum',
        gps: 'GPS',
        colorSpace: 'Kleurruimte',
        dimensions: 'Afmetingen (EXIF)',
      },
      thumbSection: 'Thumbnail vs origineel',
      thumbLabel: 'Thumbnail',
      originalLabel: 'Origineel',
      thumbNote: 'Als thumbnail en origineel duidelijk verschillen is de foto na de thumbnailgeneratie bewerkt.',
      noThumb: 'Geen embedded thumbnail',
      locale: 'nl-NL',
    },
    export: {
      heading: 'Export',
      subtitle: 'Scores en bestandsinfo als JSON',
      button: 'Download rapport',
    },
    consent: {
      message: 'Deze app gebruikt Sentry (foutrapportage) en PostHog (analytics) om de kwaliteit te verbeteren. Er worden geen afbeeldingen verstuurd — alleen technische fout- en gebruiksdata.',
      accept: 'Accepteren',
      decline: 'Weigeren',
    },
    notFound: {
      code: '404',
      title: 'Pagina niet gevonden',
      back: 'Terug naar home',
    },
    verdict: {
      heading: 'Verdict',
      ok: 'Waarschijnlijk authentiek',
      warn: 'Onbeslist',
      alert: 'Waarschijnlijk gemanipuleerd',
      score: (n: string) => `Manipulatiescore: ${n}%`,
      subtext: {
        ok: 'Geen significante manipulatie-indicatoren gevonden.',
        warn: 'Enkele lichte indicatoren aanwezig — bekijk de views voor details. Let op: moderne smartphones (iPhone, Pixel, Samsung) scoren van nature hoger door multi-frame verwerking en computationele fotografie.',
        alert: 'Meerdere sterke indicatoren wijzen op bewerking — controleer ELA en Noise Map. Let op: computationele fotografie kan ELA-scores verhogen op authentieke smartphonefoto\'s.',
      },
    },
  },

  en: {
    app: {
      subtitle: 'Upload an image to generate all views',
      newImage: 'New image',
      loading: 'Generating views…',
    },
    dropzone: {
      headline: 'Drop an image here',
      hint: 'or paste (Ctrl+V) — JPG, PNG, WebP, AVIF',
      uploadButton: 'Browse files',
      urlButton: 'Paste URL',
    },
    urlModal: {
      title: 'Image URL',
      placeholder: 'https://…',
      load: 'Load',
      cancel: 'Cancel',
      errorNotImage: 'This doesn\'t look like a direct image URL. Right-click the image → "Copy image address".',
      errorFailed: "Couldn't fetch the image. Check if the URL is still valid.",
    },
    lightbox: {
      close: 'Close (Escape)',
      zoomHint: 'Scroll to zoom · Drag to pan',
      reset: 'reset',
    },
    prediction: {
      heading: 'Analysis',
      elaHighTitle: 'High ELA deviation',
      elaHighDetail: (score: string) =>
        `Score: ${score}% — Multiple zones respond significantly differently to JPEG re-compression. This is a strong indicator of copy-paste, local retouching, or compositing. Inspect the ELA view for bright spots.`,
      elaWarnTitle: 'Moderate ELA deviation',
      elaWarnDetail: (score: string) =>
        `Score: ${score}% — Minor JPEG compression inconsistencies present. May indicate light edits, multiple save rounds, or heavily cropped areas.`,
      noiseHighTitle: 'Strongly inconsistent noise pattern',
      noiseHighDetail: (score: string) =>
        `Score: ${score}% — Noise level varies significantly between areas. Clone stamps, inpainting, or pasted elements from a different camera lack the organic noise of the rest of the photo.`,
      noiseWarnTitle: 'Inconsistent noise pattern',
      noiseWarnDetail: (score: string) =>
        `Score: ${score}% — Minor noise pattern inconsistency. May indicate soft retouching, content-aware fill, or a strong sharpness difference between areas.`,
      sobelWarnTitle: 'Unusually high edge density',
      sobelWarnDetail: (score: string) =>
        `Score: ${score}% — High average edge strength. Check the Edge Detection view for halos or overly sharp cutouts indicating compositing.`,
      okTitle: 'No clear manipulation indicators',
      okDetail: 'The analyzed metrics show no strong signs of editing. This does not rule out manipulation — also assess the views visually, especially ELA and Noise Map.',
    },
    histogram: {
      heading: 'RGB Histogram',
      red: 'Red',
      green: 'Green',
      blue: 'Blue',
      gapWarning: 'Gaps detected in the histogram — typical for levels or curves adjustments.',
    },
    exif: {
      heading: 'EXIF Metadata',
      loading: 'Loading metadata…',
      noData: 'No EXIF data found — image may have been stripped or never captured by a camera.',
      softwareFlag: (sw: string) => `Software field contains "${sw}" — direct evidence the image was processed by editing software.`,
      noCamera: 'Camera make/model missing — authentic camera captures always include this.',
      noOriginalDate: 'DateTimeOriginal missing but DateTimeDigitized present — indicates reprocessing or export.',
      noDates: 'All date fields missing — stripped EXIF or synthetically generated image.',
      timelineAlert: (capture: string, file: string) => `Capture date (${capture}) is AFTER file date (${file}) — impossible for an authentic file.`,
      gpsMismatch: (gps: string) => `GPS date (${gps}) differs from capture date — location may have been added after the fact.`,
      gpsNoDate: 'GPS coordinates present but GPS timestamp missing — inconsistent metadata.',
      thumbMismatch: "Embedded thumbnail doesn't match the main image — classic sign of editing after export.",
      allOk: 'No suspicious metadata indicators found.',
      rowLabels: {
        make: 'Make',
        model: 'Model',
        software: 'Software',
        captureDate: 'Capture date',
        digitizationDate: 'Digitization date',
        fileDate: 'File date',
        gps: 'GPS',
        colorSpace: 'Color space',
        dimensions: 'Dimensions (EXIF)',
      },
      thumbSection: 'Thumbnail vs original',
      thumbLabel: 'Thumbnail',
      originalLabel: 'Original',
      thumbNote: 'If thumbnail and original clearly differ, the image was edited after the thumbnail was generated.',
      noThumb: 'No embedded thumbnail',
      locale: 'en-US',
    },
    export: {
      heading: 'Export',
      subtitle: 'Scores and file info as JSON',
      button: 'Download report',
    },
    consent: {
      message: 'This app uses Sentry (error reporting) and PostHog (analytics) to improve quality. No images are sent — only technical error and usage data.',
      accept: 'Accept',
      decline: 'Decline',
    },
    notFound: {
      code: '404',
      title: 'Page not found',
      back: 'Back to home',
    },
    verdict: {
      heading: 'Verdict',
      ok: 'Likely authentic',
      warn: 'Inconclusive',
      alert: 'Likely manipulated',
      score: (n: string) => `Manipulation score: ${n}%`,
      subtext: {
        ok: 'No significant manipulation indicators found.',
        warn: 'Some minor indicators present — review the views for details. Note: modern smartphones (iPhone, Pixel, Samsung) naturally score higher due to multi-frame processing and computational photography.',
        alert: 'Multiple strong indicators point to editing — check ELA and Noise Map. Note: computational photography can elevate ELA scores on authentic smartphone photos.',
      },
    },
  },
} as const

export const viewDescriptions: Record<string, { nl: string; en: string }> = {
  original: {
    nl: 'Referentieafbeelding. Vergelijk elke andere view hiermee om afwijkingen te spotten. Let op: schaduwrichting ten opzichte van de lichtbron, perspectief-inconsistenties tussen objecten, en randen die te scherp of te glad zijn voor de omgeving.',
    en: 'Reference image. Compare every other view against this to spot anomalies. Look for: shadow direction vs. the light source, perspective inconsistencies between objects, and edges that are unnaturally sharp or smooth for the scene.',
  },
  ela: {
    nl: 'Error Level Analysis — herslaat de foto als JPEG en vergroot het verschil 20×. Bewerkte zones compressen anders en lichten op als heldere vlekken. De sterkste tool voor het detecteren van copy-paste, retouche en compositing. Let op: heldere vlekken of zones — hoe feller, hoe sterker het bewijs. Donkere uniforme gebieden zijn origineel. Vergelijk de helderheid van het verdachte object met de achtergrond.',
    en: 'Error Level Analysis — re-saves the image as JPEG and amplifies the difference 20×. Edited zones compress differently and appear as bright spots. The strongest tool for detecting copy-paste, retouching, and compositing. Look for: bright spots or zones — the brighter, the stronger the evidence. Dark uniform areas are original. Compare the brightness of the suspected object with its surroundings.',
  },
  'noise-map': {
    nl: 'Isoleert de ruislaag via high-pass filtering. Kloonstempels, inpainting en AI-gebieden missen de organische ruis van de camera — die zones verschijnen hier als te glad of met een afwijkend patroon. Let op: te gladde vlakken te midden van organische ruis, of een gebied met duidelijk grover of fijner ruis dan de rest.',
    en: 'Isolates the noise layer via high-pass filtering. Clone stamps, inpainting, and AI-generated areas lack the organic camera noise — those zones appear too smooth or with a deviating pattern. Look for: areas that are too smooth compared to surrounding noise, or a region with clearly coarser or finer grain than the rest.',
  },
  sobel: {
    nl: "Sobel-operator berekent de gradiëntsterkte per pixel. Onnatuurlijk scherpe randen op logisch zachte plekken, of halo's rond ingeplakte objecten, zijn directe tekenen van compositing. Let op: dubbele of dikkere randen (halo) rondom objecten die er normaal uitknipbaar uitzien — klassiek teken van copy-paste compositing.",
    en: "Sobel operator computes gradient magnitude per pixel. Unnaturally sharp edges in logically soft areas, or halos around pasted objects, are direct signs of compositing. Look for: double or thickened edges (halos) around objects that appear cut-out — a classic sign of copy-paste compositing.",
  },
  negative: {
    nl: 'Alle tonen omgekeerd. Retoucheringen en zachte blending die in het origineel onzichtbaar zijn kunnen als toonverschillen oplichten. Let op: vlekken, banden of toonverschillen die in het origineel niet zichtbaar waren — zachte retouche of healing brush laat hier vaak sporen na.',
    en: 'All tones inverted. Retouching and soft blending invisible in the original may appear as tone differences here. Look for: spots, bands, or tonal patches not visible in the original — soft retouching or healing brush often leaves traces here.',
  },
  grayscale: {
    nl: 'Puur luminantiepatroon zonder kleur. Inconsistente belichting tussen object en achtergrond — verrader van compositing — is hier makkelijker te zien. Let op: een object dat te licht of te donker is voor de omgeving, of een schaduw die de verkeerde richting opgaat.',
    en: 'Pure luminance pattern without color. Inconsistent lighting between object and background — a telltale sign of compositing — is easier to spot here. Look for: an object that is too bright or too dark for its surroundings, or a shadow going the wrong direction.',
  },
  'high-contrast': {
    nl: 'Contrast extreem opgevoerd. Onlogische lichtrichting, zachte schaduwen die niet passen of kunstmatig vloeiende overgangen zijn hier duidelijker zichtbaar. Let op: de schaduw die een object werpt — klopt de richting met de lichtbron? Objecten die te "zweven" lijken of randen zonder overgangsschaduw.',
    en: 'Contrast pushed to extremes. Illogical light direction, mismatched soft shadows, or artificially smooth transitions are more visible here. Look for: shadow direction — does it match the light source? Objects that appear to float, or edges with no transition shadow.',
  },
  hue: {
    nl: 'Kleurschakering (H uit HSV) als grijswaarden. Selectieve kleurveranderingen vallen op als blokken met een te uniforme of abrupt veranderende hue. Let op: rechthoekige zones met een duidelijk andere grijswaarde te midden van variërend omliggend materiaal — dit wijst op selectieve kleurcorrectie of een ingeplakt element.',
    en: 'Hue (H from HSV) as grayscale. Selective color edits stand out as blocks with an unnaturally uniform or abruptly shifting hue. Look for: rectangular zones with a clearly different gray value amid varying surrounding material — this indicates selective color correction or a pasted element.',
  },
  saturation: {
    nl: 'Verzadiging (S uit HSV) als grijswaarden. Lokaal opgedraaide of verlaagde verzadiging en selective color zijn hier direct zichtbaar. Let op: lokale pieken — sterk heldere zones wijzen op overdreven verzadiging, zwarte zones op volledig ontverzadigde gebieden. Beide kunnen duiden op selectieve nabewerking.',
    en: 'Saturation (S from HSV) as grayscale. Locally boosted or reduced saturation and selective color edits are directly visible here. Look for: local spikes — very bright zones indicate heavy saturation boosts, black zones indicate fully desaturated areas. Both can indicate selective post-processing.',
  },
  'clone-detect': {
    nl: "Heuristiek voor copy-move detectie — vergelijkt overlappende 16×16 blokken op gelijkenis en markeert verdachte kopieën in rood. Uniforme gebieden (hemel, muur) kunnen false positives geven. Combineer altijd met ELA voor bevestiging. Let op: rode markeringen op geometrisch logische plaatsen — een kloon volgt een herhaalpatroon. Negeer markeringen op grote uniforme vlakken zoals hemel, gras of muren.",
    en: 'Copy-move detection heuristic — compares overlapping 16×16 blocks for similarity and marks suspected copies in red. Uniform areas (sky, walls) can produce false positives. Always combine with ELA for confirmation. Look for: red markers at geometrically logical positions — a real clone follows a repeating pattern. Ignore markers on large uniform areas like sky, grass, or walls.',
  },
  'red-channel': {
    nl: 'Alleen rode kleurdata. Ingeplakte elementen van een andere camera hebben een afwijkend ruispatroon — vergelijk de textuur van het verdachte object met de achtergrond. Let op: een zone waar het grain duidelijk anders is dan de omgeving — meer of minder grofkorrelig. Camera-ruis is consistent over de hele sensor.',
    en: 'Red color channel only. Pasted elements from a different camera have a deviating noise pattern — compare the texture of the suspected object with the background. Look for: a zone where the grain is clearly different from the surroundings — coarser or finer. Camera noise is consistent across the entire sensor.',
  },
  'green-channel': {
    nl: 'Groen kanaal — het schoonste kanaal. Inconsistenties in ruis of scherpte die hier zichtbaar zijn maar niet in andere kanalen wijzen op een verschillende opnamebron. Let op: een object of zone met duidelijk afwijkende textuur of grain ten opzichte van de achtergrond — ingeplakt materiaal heeft altijd een andere ruisstructuur.',
    en: 'Green channel — the cleanest channel. Inconsistencies in noise or sharpness visible here but not in other channels point to a different capture source. Look for: an object or zone with clearly deviating texture or grain compared to the background — pasted material always has a different noise structure.',
  },
  'blue-channel': {
    nl: 'Blauw kanaal — bevat het meeste sensorruis. Compositing van beelden van verschillende bronnen is hier het makkelijkst te herkennen aan een abrupt veranderend ruispatroon. Let op: een zone met duidelijk minder of meer grain dan de omgeving — het blauwe kanaal vergroot ruisver schillen het sterkst en maakt inhomogeniteit het best zichtbaar.',
    en: 'Blue channel — contains the most sensor noise. Compositing images from different sources is easiest to detect here through an abruptly changing noise pattern. Look for: a zone with clearly less or more grain than the surroundings — the blue channel amplifies noise differences the most and makes inhomogeneity most visible.',
  },
  'jpeg-ghost': {
    nl: 'Comprimeert de afbeelding op 6 kwaliteitsniveaus en vergelijkt per pixel welk niveau het best aansluit. Authentieke gebieden clusteren rond één kwaliteitsniveau (donker). Ingeplakte elementen van een andere bron — anders gecomprimeerd — lichten op in oranje-rood. Let op: oranje of rood oplichtende vlekken of zones. Hoe feller de kleur, hoe groter het verschil in JPEG-kwaliteit — sterke aanwijzing dat het gebied van een andere afbeelding afkomstig is.',
    en: 'Compresses the image at 6 quality levels and compares per pixel which level fits best. Authentic areas cluster around one quality level (dark). Pasted elements from a different source — compressed differently — light up in orange-red. Look for: orange or red glowing spots or zones. The brighter the color, the greater the JPEG quality difference — strong evidence the area came from a different image.',
  },
  'fft-spectrum': {
    nl: 'Frequentiedomein via 2D Fourier-transformatie. Het spectrum toont de verdeling van ruimtelijke frequenties. AI-gegenereerde beelden en upscaling tonen afwijkende patronen. Periodieke stippen of lijnen wijzen op tiling, interpolatie-artefacten of herhalende textuurpatronen. Let op: regelmatig verdeelde stippen of extra horizontale/verticale lijnen buiten het centrale kruis. Een normaal beeld toont alleen het kruis in het midden — alles extra is verdacht.',
    en: 'Frequency domain via 2D Fourier transform. The spectrum shows the distribution of spatial frequencies. AI-generated images and upscaling show deviating patterns. Periodic dots or lines indicate tiling, interpolation artifacts, or repeating texture patterns. Look for: evenly spaced dots or extra horizontal/vertical lines outside the central cross. A normal image shows only the center cross — anything extra is suspicious.',
  },
}
