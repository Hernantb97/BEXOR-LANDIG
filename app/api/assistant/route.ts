import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

// Assistant ID por defecto
const defaultAssistantId = process.env.NEXT_PUBLIC_OPENAI_ASSISTANT_ID;

// Caché local para guardar asistentes personalizados
const assistantsCache = new Map<string, string>();

export async function POST(request: NextRequest) {
  if (!defaultAssistantId) {
    return NextResponse.json(
      { error: "Assistant ID not configured" },
      { status: 500 }
    );
  }

  try {
    const { threadId, message, action, config } = await request.json();
    const assistantName = config?.name || "Asistente AI de BEXOR";
    const assistantInstructions = config?.instructions || 
      "Eres un asistente de ventas amable y eficiente que ayuda a los clientes interesados en productos y servicios de BEXOR.";

    // Crear un nuevo hilo
    if (action === "createThread") {
      const thread = await openai.beta.threads.create();
      
      // Si hay configuración personalizada, crear o reutilizar un asistente personalizado
      if (config && (config.name !== "Asistente AI de BEXOR" || config.instructions)) {
        // Crear una clave única basada en name e instructions
        const configKey = `${config.name}:${config.instructions}`;
        
        // Comprobar si ya existe este asistente en la caché
        let assistantId = assistantsCache.get(configKey);
        
        if (!assistantId) {
          // Crear un nuevo asistente personalizado
          try {
            const assistant = await openai.beta.assistants.create({
              name: config.name,
              instructions: config.instructions,
              model: "gpt-4o",
            });
            
            assistantId = assistant.id;
            assistantsCache.set(configKey, assistantId);
          } catch (error) {
            console.error("Error al crear asistente personalizado:", error);
            // Usar el asistente por defecto si hay error
            assistantId = defaultAssistantId;
          }
        }
        
        return NextResponse.json({ 
          threadId: thread.id,
          assistantId 
        });
      }
      
      return NextResponse.json({ 
        threadId: thread.id,
        assistantId: defaultAssistantId 
      });
    }

    // Enviar mensaje y obtener respuesta
    if (action === "sendMessage" && threadId && message) {
      let assistantId = defaultAssistantId;
      
      // Si hay configuración personalizada, buscar o crear el asistente
      if (config && (config.name !== "Asistente AI de BEXOR" || config.instructions)) {
        const configKey = `${config.name}:${config.instructions}`;
        const cachedAssistantId = assistantsCache.get(configKey);
        
        if (cachedAssistantId) {
          assistantId = cachedAssistantId;
        } else {
          try {
            const assistant = await openai.beta.assistants.create({
              name: config.name,
              instructions: config.instructions,
              model: "gpt-4o",
            });
            
            assistantId = assistant.id;
            assistantsCache.set(configKey, assistantId);
          } catch (error) {
            console.error("Error al crear asistente personalizado:", error);
            // Usar el asistente por defecto si hay error
            assistantId = defaultAssistantId;
          }
        }
      }

      // Añadir mensaje al hilo
      await openai.beta.threads.messages.create(threadId, {
        role: "user",
        content: message,
      });

      // Ejecutar el asistente en el hilo
      const run = await openai.beta.threads.runs.create(threadId, {
        assistant_id: assistantId,
      });

      // Esperar a que termine la ejecución (enfoque de polling)
      let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
      
      // Polling para comprobar finalización
      while (runStatus.status === "in_progress" || runStatus.status === "queued") {
        // Esperar 1 segundo antes de comprobar de nuevo
        await new Promise((resolve) => setTimeout(resolve, 1000));
        runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
      }

      if (runStatus.status === "completed") {
        // Obtener los mensajes del hilo
        const threadMessages = await openai.beta.threads.messages.list(threadId);
        
        // Encontrar el último mensaje del asistente
        const latestMessage = threadMessages.data.find(
          (msg) => msg.role === "assistant" && msg.run_id === run.id
        );
        
        if (latestMessage && latestMessage.content[0].type === "text") {
          return NextResponse.json({
            response: latestMessage.content[0].text.value,
          });
        } else {
          return NextResponse.json({ response: "No response generated" });
        }
      } else {
        return NextResponse.json(
          { error: `Run failed with status: ${runStatus.status}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: "Invalid request parameters" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 