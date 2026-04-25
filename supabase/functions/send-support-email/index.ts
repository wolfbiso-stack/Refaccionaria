const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Manejar CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error('Missing RESEND_API_KEY environment variable')
    }

    const body = await req.json().catch(() => ({}))
    const { name, email, subject, message } = body

    if (!name || !email || !message) {
      throw new Error('Name, email, and message are required')
    }

    const adminEmail = "cordobesa_refacciones@hotmail.com"
    
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Cordobesa Refacciones <no-responder@cordobesarefacciones.mx>',
        to: [adminEmail],
        reply_to: email,
        subject: `Nuevo Mensaje de Soporte: ${subject || 'Soporte Técnico'}`,
        html: `
          <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; padding: 20px;">
            <h1 style="color: #fdc401; margin-bottom: 20px; text-align: center;">Nuevo Mensaje de Soporte</h1>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
              <h2 style="margin-top: 0; font-size: 18px; color: #555;">Información del Cliente</h2>
              <p><strong>Nombre:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Asunto:</strong> ${subject || 'Sin asunto'}</p>
            </div>

            <div style="background: #fff; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
              <h2 style="margin-top: 0; font-size: 18px; color: #555;">Mensaje:</h2>
              <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
            </div>
            
            <p style="margin-top: 30px; font-size: 11px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
              Este es un correo automático generado por el sistema de Refaccionaria Cordobesa.
            </p>
          </div>
        `,
      }),
    })

    const resData = await res.json()

    if (!res.ok) {
      console.error('Resend error:', resData)
      return new Response(JSON.stringify({ error: resData.message || 'Resend error', details: resData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: res.status,
      })
    }

    return new Response(JSON.stringify(resData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    console.error('Function error:', errorMessage)
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
