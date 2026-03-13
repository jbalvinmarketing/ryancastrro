

## Plan: Actualizar lobobot-products.liquid con z-index fix

El archivo ya tiene todo lo que necesitas (grid configurable, filtro por handles, carrito). Solo falta el fix del `z-index: 0` en `.lobobot-section` para que el header de Shopify siempre quede por encima.

### Cambio exacto

En la línea 15-22, agregar `z-index: 0;` a `.lobobot-section`:

```css
.lobobot-section {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: hsl(0 0% 5%);
  font-family: 'Inter', sans-serif;
  color: hsl(0 0% 95%);
  z-index: 0;  /* ← NUEVO: evita que la sección pase por encima del header */
}
```

Te mandaré el archivo completo con este cambio aplicado para que lo copies y pegues directo en Shopify.

