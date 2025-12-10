📻 **Player de Rádio - SISCOF News**

## Status Atual

✅ **Player já está implementado e funcionando!**

O sistema já possui um player de rádio fixo integrado em [`RadioPlayer.tsx`](file:///d:/SISTEMA%20SISCOFNEWS%202025/nexus-culto-sync-main/src/components/layout/RadioPlayer.tsx) que:

- ✅ Aparece **fixo no topo** de todas as páginas
- ✅ Tem **autoplay** ao carregar a página  
- ✅ Controles de **Play/Pause**
- ✅ Controle de **volume** com slider
- ✅ **Persiste** entre navegação de páginas
- ✅ **Responsivo** para mobile e desktop
- ✅ Integrado com chat de rádio

## 📝 Configuração Necessária

### Atualizar URL da Stream

Abra o arquivo [`RadioPlayer.tsx`](file:///d:/SISTEMA%20SISCOFNEWS%202025/nexus-culto-sync-main/src/components/layout/RadioPlayer.tsx) e na **linha 10** altere:

```typescript
const STREAM_URL = "https://stream.zeno.fm/sz648756238uv";
```

Para a **URL real da sua rádio**:

```typescript
const STREAM_URL = "https://sua-radio-stream-url-aqui";
```

### Opções de Stream Populares:

1. **Zeno.FM**: `https://stream.zeno.fm/seu-id`
2. **Icecast/Shoutcast**: `http://servidor:porta/stream`
3. **Radio.co**: `https://streaming.radio.co/seu-id`
4. **Outras plataformas**: Consulte documentação do provedor

## 🎨 Como Está Agora

O player exibe:
- **Nome**: "Rádio Missões Pelo Mundo"
- **Status**: "Ao Vivo 🔴"
- **Cor**: Vermelho (#D32F2F) - tema da rádio
- **Logo**: Pode adicionar logo em `/public/radio-logo.jpg`

## 🔧 Próximos Passos

1. **Obtenha a URL da stream** da sua rádio
2. **Atualize** a linha 10 do `RadioPlayer.tsx`
3. **Teste** acessando o sistema
4. **(Opcional)** Adicione logo da rádio em `/public/radio-logo.jpg`

## ⚠️ Importante

O autoplay pode ser bloqueado por alguns navegadores modernos (Chrome, Safari) até que o usuário interaja com a página pela primeira vez. Isso é uma limitação de segurança dos navegadores.
