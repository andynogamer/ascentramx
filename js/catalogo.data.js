/**
 * Datos del catálogo. Mantén sincronizado con catalogo.json al editar equipos.
 */
export default {
  categorias: [
    {
      nombre: 'PLATAFORMAS DE ELEVACION',
      id: 'plataformas',
      texto_boton: 'Ficha tecnica',
      equipos: [
        {
          nombre: 'Genie GS-2646',
          descripcion: 'Tijera eléctrica · 26 ft',
          imagen: 'assets/images/2646.webp',
          ficha_tecnica: 'assets/data-sheet/Tijera 2646.png',
        },
        {
          nombre: 'Genie GS-3246',
          descripcion: 'Tijera eléctrica · 32 ft',
          imagen: 'assets/images/GS3246.jpg',
          ficha_tecnica: 'assets/data-sheet/Tijera 3246.png',
        },
        {
          nombre: 'Genie Z-30/20N',
          descripcion: 'Articulada eléctrica · 30 ft',
          imagen: 'assets/images/Z30.jpg',
          ficha_tecnica: 'assets/data-sheet/Z30ft-DC (Electrica).png',
        },
        {
          nombre: 'Genie Z-34/22 DC',
          descripcion: 'Articulada eléctrica · 34 ft',
          imagen: 'assets/images/Z34.jpg',
          ficha_tecnica: 'assets/data-sheet/Z34ft-DC (Electrica).png',
        },
        {
          nombre: 'Genie Z-45/25 DC',
          descripcion: 'Articulada eléctrica · 45 ft',
          imagen: 'assets/images/z45dc%282%29.jpg',
          ficha_tecnica: 'assets/data-sheet/Z45ft-DC (Electrica).png',
        },
        {
          nombre: 'Genie Z-45/25 RT',
          descripcion: 'Articulada diésel · 45 ft',
          imagen: 'assets/images/z45rt.png',
          ficha_tecnica: 'assets/data-sheet/Z45ft-RT (Diesel).png',
        },
        {
          nombre: 'JLG E400AJ',
          descripcion: 'Articulada eléctrica · 40 ft',
          imagen: 'assets/images/e400.webp',
          ficha_tecnica: 'assets/data-sheet/E400 (Electrica).png',
        },
        {
          nombre: 'JLG 600AJ',
          descripcion: 'Articulada eléctrica 4x4 · 60 ft',
          imagen: 'assets/images/e600.webp',
          ficha_tecnica: 'assets/data-sheet/600AJ (Electrica).png',
        },
        {
          nombre: 'JLG 600AJ',
          descripcion: 'Articulada diésel 4x4 · 60 ft',
          imagen: 'assets/images/600aj.jpg',
          ficha_tecnica: 'assets/data-sheet/600AJ (Diesel).png',
        },
        {
          nombre: 'Genie Z-80/60',
          descripcion: 'Articulada diésel 4x4 · 80 ft',
          imagen: 'assets/images/Z80.jpg',
          ficha_tecnica: 'assets/data-sheet/Z80ft RT (Diesel).png',
        },
      ],
    },
    {
      nombre: 'MAQUINARIA',
      id: 'maquinaria',
      texto_boton: 'Ver Informacion',
      equipos: [
        {
          nombre: 'RETROEXCAVADORA',
          descripcion: 'Excavación y movimiento de materiales',
          imagen: 'assets/images/retro.jpg',
          ficha_tecnica: 'assets/data-sheet/Retroexcavadora.png',
        },
        {
          nombre: 'MINICARGADOR',
          descripcion: 'Carga, acarreo y espacios reducidos',
          imagen: 'assets/images/bobcat.webp',
          ficha_tecnica: 'assets/data-sheet/Minicargador Bobcat.png',
        },
        {
          nombre: 'TORRE DE ILUMINACIÓN',
          descripcion: 'Iluminación para obras y trabajos nocturnos',
          imagen: 'assets/images/torres%20de%20luz.png',
          ficha_tecnica: 'assets/data-sheet/Torre de luz.png',
        },
        {
          nombre: 'GENERADOR 75 kVA',
          descripcion: 'Energía eléctrica para obras e industria',
          imagen: 'assets/images/generador.jpg',
          ficha_tecnica: 'assets/data-sheet/Generador.png',
        },
        {
          nombre: 'MONTACARGAS',
          descripcion: 'Carga, descarga y movimiento de materiales',
          imagen: 'assets/images/montacargas.jpg',
          ficha_tecnica: 'assets/data-sheet/Montacargas.png',
        },
        {
          nombre: 'MANIPULADOR TELESCÓPICO',
          descripcion: 'Elevación y manejo de cargas a gran alcance',
          imagen: 'assets/images/manipulador.jpg',
          ficha_tecnica: 'assets/data-sheet/Manipulador.png',
        },
      ],
    },
  ],
};
