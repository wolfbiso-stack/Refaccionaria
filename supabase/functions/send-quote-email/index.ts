import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { folio, profile, items } = await req.json()

    const adminEmail = "cordobesa_refacciones@hotmail.com"
    
    // Formatear la lista de productos
    const itemsHtml = items.map((item: any) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.sku}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      </tr>
    `).join('')

    const clientName = profile.is_corporate 
      ? profile.corporate_name 
      : `${profile.first_name} ${profile.last_name || ''}`

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Cordobesa Refacciones <onboarding@resend.dev>', // Cambiar por tu dominio verificado
        to: [adminEmail],
        subject: `Nueva Cotización Generada: ${folio}`,
        html: `
          <div style="font-family: sans-serif; color: #333;">
            <h1 style="color: #fdc401;">Nueva Cotización Recibida</h1>
            <p>Se ha generado una nueva cotización en el sistema.</p>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
              <h2 style="margin-top: 0;">Datos del Cliente</h2>
              <p><strong>Folio:</strong> ${folio}</p>
              <p><strong>Nombre:</strong> ${clientName}</p>
              <p><strong>RFC:</strong> ${profile.rfc || 'N/A'}</p>
              <p><strong>Teléfono:</strong> ${profile.phone || 'N/A'}</p>
              <p><strong>Email:</strong> ${profile.email}</p>
            </div>

            <h2>Detalles del Pedido</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #eee;">
                  <th style="padding: 8px; text-align: left;">SKU</th>
                  <th style="padding: 8px; text-align: left;">Referencia</th>
                  <th style="padding: 8px; text-align: center;">Cant</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <p style="margin-top: 30px; font-size: 12px; color: #666;">
              Este es un correo automático generado por el sistema de Refaccionaria Cordobesa.
            </p>
          </div>
        `,
      }),
    })

    const data = await res.json()

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
