import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title } = body;

    if (!title) {
      return NextResponse.json({ error: 'El título es requerido' }, { status: 400 });
    }

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'user', content: `Genera un contenido de blog basado en el siguiente título: "${title}"` },
        ],
        max_tokens: 350,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    return NextResponse.json({ content: response.data.choices[0].message.content }, { status: 200 });
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);

    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json({ error: error.response.data }, { status: error.response.status });
    }

    return NextResponse.json({ error: 'Error al procesar la solicitud' }, { status: 500 });
  }
}
