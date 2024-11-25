import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'El título es requerido' });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: `Genera un contenido de blog basado en el siguiente título: "${title}"` },
      ],
    });

    return res.status(200).json({ content: completion.choices[0].message.content });
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    return res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
}
