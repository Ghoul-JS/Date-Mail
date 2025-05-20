import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import EventModel from '../models/event.model';

export async function createGoogleEvents({
  oAuth2Client,
  userId,
  correosRelevantes
}: {
  oAuth2Client: OAuth2Client;
  userId: string;
  correosRelevantes: any[];
}) {
  const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

  const etiquetasRelevantes = [
    'appointment',
    'date',
    'time',
    'hour',
    'schedule',
    'meeting',
    'interview',
    'due date'
  ];

  const umbral = 0.95;
  const yaProcesados = new Set<string>();
  const eventosCreados = []; //

  for (const correo of correosRelevantes) {
    const { fechaDetectada, texto, etiquetas, puntuaciones } = correo;
    const textoMin = texto.toLowerCase();

    if (yaProcesados.has(textoMin)) {
      console.log('🔁 Correo ya procesado (texto duplicado). Omitiendo.');
      continue;
    }

    const palabrasClaveProhibidas = ['stream', 'just chatting', 'twitch', 'youtube live', 'westcol'];
    const contieneContenidoNoRelevante = palabrasClaveProhibidas.some(p => textoMin.includes(p));

    if (contieneContenidoNoRelevante) {
      console.log('🚫 Correo contiene contenido no relevante:', textoMin.slice(0, 100));
      continue;
    }

    const etiquetasFiltradas = etiquetas
      ?.map((tag: string, index: number) => ({ tag, score: puntuaciones?.[index] || 0 }))
      .filter(({ tag, score }: {tag: string, score: number}) => etiquetasRelevantes.includes(tag) && score >= umbral);

    const esRelevante = fechaDetectada && etiquetasFiltradas?.length > 0;

    if (!esRelevante) {
      console.log('⛔ Correo NO relevante por falta de etiquetas o fecha:', {
        texto: texto.slice(0, 80),
        etiquetas,
        puntuaciones,
        fechaDetectada
      });
      continue;
    }

    yaProcesados.add(textoMin);

    const fecha = new Date(fechaDetectada);
    const fechaMin = new Date(fecha.getTime() - 5 * 60 * 1000);
    const fechaMax = new Date(fecha.getTime() + 5 * 60 * 1000);

    const duplicado = await EventModel.findOne({
      userId,
      fechaDetectada: { $gte: fechaMin, $lte: fechaMax }
    });

    if (duplicado) {
      console.log('⚠️ Evento duplicado detectado en Mongo para:', fecha.toISOString());
      continue;
    }

    try {
      const event = {
        summary: texto.slice(0, 150),
        description: texto,
        start: { dateTime: fecha.toISOString() },
        end: {
          dateTime: new Date(fecha.getTime() + 30 * 60 * 1000).toISOString()
        }
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event
      });

      console.log('✅ Evento creado en Google:', response.data.summary);

      await EventModel.create({
        userId,
        fechaDetectada: fecha,
        resumen: texto.slice(0, 150),
        googleEventId: response.data.id
      });

      console.log('📝 Evento guardado en Mongo con ID:', response.data.id);

      eventosCreados.push({
        googleEventId: response.data.id,
        resumen: response.data.summary,
        fecha: response.data.start?.dateTime
      });

    } catch (error: any) {
      console.error('❌ Error al crear evento:', error.message || error);
    }
  }

  return eventosCreados;
}
