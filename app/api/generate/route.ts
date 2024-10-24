import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const huggingfaceApiKey = process.env.HUGGINGFACE_API_KEY;

    if (!huggingfaceApiKey) {
      throw new Error('No se encontró la clave API de Hugging Face.');
    }

    if (!prompt) {
      return NextResponse.json({ message: 'El campo prompt es requerido' }, { status: 400 });
    }

    const response = await fetch('https://api-inference.huggingface.co/models/EleutherAI/gpt-neo-2.7B', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${huggingfaceApiKey}`,
      },
      body: JSON.stringify({
        inputs: prompt,  // Enviar el prompt como entrada
        parameters: {
          max_length: 500,
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error en la API de Hugging Face:', errorData);
      return NextResponse.json({ message: `Error en la API de Hugging Face: ${errorData.error || errorData.message}` }, { status: 500 });
    }

    const data = await response.json();

    if (!data.generated_text) {
      console.error('No se encontró generated_text en la respuesta:', data);
      return NextResponse.json({ message: 'No se pudo generar la descripción.' }, { status: 500 });
    }

    return NextResponse.json({ description: data.generated_text });

  } catch (error) {
    console.error('Error en la API de Hugging Face:', error);
    return NextResponse.json({ message: 'Error al procesar la solicitud.' }, { status: 500 });
  }
}
