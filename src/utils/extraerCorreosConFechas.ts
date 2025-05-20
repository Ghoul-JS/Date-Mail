import * as chrono from "chrono-node";
import { DateTime } from "luxon";

type CorreoProcesado = {
  texto: string;
  etiquetas: string[];
  puntuaciones: number[];
  fechaDetectada: Date | null | string;
};

const getNumberOrUndefined = (value: number | null): number | undefined =>
  value === null ? undefined : value;

// Función para limpiar el texto antes de pasarlo a chrono
const limpiarTextoParaHora = (texto: string): string => {
  const limpio = texto
    .replace(/[⋅•·–—→\-]+/g, " ") // reemplaza símbolos por espacio
    .replace(/[^a-zA-Z0-9:.,\s]/g, "") // elimina caracteres raros excepto dos puntos, comas, puntos y espacios
    .replace(/\s+/g, " ") // colapsa múltiples espacios
    .replace(/(?:Enviado desde mi.*|Sent from my.*|—+\s*.*)/gi, "")
    .replace(/.*unsubscribe.*|.*no-responder.*|.*confidencial.*/gi, "")
    .trim();
  console.log("🧹 Texto original:", texto);
  console.log("✅ Texto limpio:", limpio);
  return limpio;
};

const extraerCorreosConFechas = (dataCruda: any[][], scoreMinimo = 0.95): CorreoProcesado[] => {
  // Log 1: Total de correos clasificados
  console.log("👉 Total de correos clasificados:", dataCruda.length);
  console.log("DATA CRUDAA: ", dataCruda);

  // Aplanar, acceder a la clave '0' si existe y filtrar por score mínimo
  const filtrados = dataCruda
    .flatMap(grupo => grupo)
    .map((correo: any) => {
      if ('0' in correo && correo['0'].labels && correo['0'].scores) {
        return correo['0'];
      }
      return correo;
    })
    .filter(correo =>
      correo.scores && correo.scores.some((score: number) => score >= scoreMinimo)
    );

  // Log 2: Correos que pasaron el filtro de puntuación
  console.log("✅ Correos con puntuación mayor a", scoreMinimo, ":", filtrados.length);

  const procesados = filtrados.map(correo => {
    let textoOriginal = correo.sequence;
    let texto = limpiarTextoParaHora(textoOriginal);

    const refDate = new Date();
    const resultados = chrono.parse(texto, refDate);
    let fechaDetectada: Date | null | string = null;

    if (resultados.length > 0) {
      const resultado = resultados[0];
      const components = resultado.start;

      let dt = DateTime.fromObject(
        {
          year: getNumberOrUndefined(components.get("year")),
          month: getNumberOrUndefined(components.get("month")),
          day: getNumberOrUndefined(components.get("day")),
          hour: getNumberOrUndefined(components.get("hour")),
          minute: getNumberOrUndefined(components.get("minute")),
        },
        { zone: "local" }
      );

      // Si chrono no detectó la hora explícitamente
      if (!components.isCertain("hour")) {
        const matchHora = texto.match(/(\d{1,2}:\d{2}(?:\s*[ap]\.?m\.?)?)/i);
        if (matchHora) {
          const horaTexto = matchHora[1].replace(/\s+/g, "").replace(/([ap])\.?m\.?/i, " $1m");
          const fechaTexto = dt.toFormat("MMMM d, yyyy");
          const nuevaFecha = chrono.parseDate(`${fechaTexto} ${horaTexto}`);
          if (nuevaFecha) {
            dt = DateTime.fromJSDate(nuevaFecha);
          }
        }
      }

      fechaDetectada = dt.setZone("local", { keepLocalTime: true }).toISO();
    }

    return {
      texto: textoOriginal,
      etiquetas: correo.labels,
      puntuaciones: correo.scores,
      fechaDetectada,
    };
  });

  const correosConFecha = procesados.filter(correo => correo.fechaDetectada !== null);

  // Log 3: Correos que tienen fecha detectada
  console.log("📅 Correos con fecha detectada:", correosConFecha.length);

  return correosConFecha;
};

export default extraerCorreosConFechas;
