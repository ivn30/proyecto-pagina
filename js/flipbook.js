$(document).ready(function () {
    $.getJSON('/api/imagenes', function (imagenes) {
      const $flipbook = $("#flipbook");
  
      function cargarImagen(src) {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(src);
          img.onerror = () => resolve(null);
          img.src = src;
        });
      }
  
      Promise.all(imagenes.map(cargarImagen)).then(resultados => {
        const imagenesValidas = resultados.filter(src => src !== null);
  
        imagenesValidas.forEach(src => {
          const $page = $("<div />").addClass("page");
          const $img = $("<img />").attr("src", src).attr("loading", "lazy");
          $page.append($img);
          $flipbook.append($page);
        });
  
        $flipbook.turn({
          width: 800,
          height: 500,
          autoCenter: true
        });
  
        $("#prevBtn").click(() => $flipbook.turn("previous"));
        $("#nextBtn").click(() => $flipbook.turn("next"));
      });
    });
  });
  