import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, phone, program, message } = body;

    const data = await resend.emails.send({
      from: 'NextGen HUB <onboarding@resend.dev>',
      to: ['tvoj_email@gmail.com'], // Zamijeni sa svojim e-mailom na koji želiš primati prijave
      subject: `Nova prijava za kurs: ${program} (${fullName})`,
      html: `
        <h2>Nova prijava na sajtu!</h2>
        <p><strong>Ime i prezime:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Telefon:</strong> ${phone || 'Nije navedeno'}</p>
        <p><strong>Izabrani program:</strong> ${program}</p>
        <p><strong>Poruka/Napomena:</strong> ${message || 'Nema poruke'}</p>
      `,
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}