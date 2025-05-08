# Componentes de Chat AI para BEXOR

Este directorio contiene los componentes relacionados con el chat AI de BEXOR, que permite integrar un asistente inteligente en la plataforma.

## Componentes Principales

### 1. AiChat

Un componente de chat completo que puede ser integrado en cualquier sección de la aplicación.

```jsx
import AiChat from "@/components/ai-chat";

// Uso básico
<AiChat />

// Uso con configuración personalizada
<AiChat 
  className="mi-clase"
  botConfig={{
    name: "Mi Asistente",
    instructions: "Eres un asistente amable que..."
  }}
  initialMessage="Hola, ¿en qué puedo ayudarte?"
  allowExport={true}
  showHeader={true}
  showSettingsButton={true}
  placeholder="Escribe tu mensaje..."
/>
```

#### Props

- `className`: Clases CSS adicionales para el componente.
- `botConfig`: Configuración del bot (nombre e instrucciones).
- `showHeader`: Muestra u oculta la cabecera (default: true).
- `showSettingsButton`: Muestra u oculta el botón de configuración (default: true).
- `initialMessage`: Mensaje inicial del asistente cuando se inicia la conversación.
- `placeholder`: Texto de placeholder para el campo de entrada.
- `allowExport`: Permite exportar la conversación (default: false).

### 2. ChatWidget

Un widget flotante de chat que aparece en la esquina de la página.

```jsx
import ChatWidget from "@/components/chat-widget";

// Uso básico
<ChatWidget />

// Uso con configuración personalizada
<ChatWidget 
  initialGreeting="Hola, ¿en qué puedo ayudarte?"
  showOnlineIndicator={true}
  delayedAppearance={true}
  position="bottom-right"
/>
```

#### Props

- `initialGreeting`: Mensaje inicial del asistente cuando se abre el chat.
- `showOnlineIndicator`: Muestra un indicador de estado en línea (default: true).
- `delayedAppearance`: Hace que el botón aparezca con un retraso para no interferir con la carga inicial (default: true).
- `position`: Posición del widget en la pantalla (valores: "bottom-right", "bottom-left", "top-right", "top-left").

### 3. BotConfigurator

Componente para configurar el asistente AI. Normalmente utilizado internamente por AiChat y ChatWidget.

```jsx
import BotConfigurator from "@/components/bot-configurator";

<BotConfigurator 
  initialConfig={botConfig}
  onConfigChange={handleConfigChange}
  onClose={handleClose}
/>
```

#### Props

- `initialConfig`: Configuración inicial del bot.
- `onConfigChange`: Función que se llama cuando cambia la configuración.
- `onClose`: Función que se llama cuando se cierra el configurador.

## Integración en la aplicación

Los componentes de chat se integran en la aplicación a través de la sección de asistente AI (`AiAssistantSection`).

```jsx
import AiAssistantSection from "@/components/ai-assistant-section";

// En la página principal
<AiAssistantSection />
```

## API del Asistente

Estos componentes se comunican con la API del asistente a través de los endpoints:

- `/api/assistant`: Punto de entrada principal para las operaciones del asistente.
  - Acción `createThread`: Crea un nuevo hilo de conversación.
  - Acción `sendMessage`: Envía un mensaje al asistente y devuelve la respuesta.

## Personalización

Todos los componentes pueden ser personalizados a través de las props y están construidos con las librerías UI de Shadcn y Framer Motion para animaciones fluidas. 