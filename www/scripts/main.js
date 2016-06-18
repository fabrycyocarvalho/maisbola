// Export selectors engine
var $$ = Dom7;

var Helper = new Helper();

// Initialize your app
var myApp = new Framework7({
  router: true,
  swipeBackPage: false,
  modalPreloaderTitle: 'Carregando...',
  smartSelectBackText: 'Voltar',
  imagesLazyLoadThreshold: 50,
  modalTitle: 'Mais Bola',
  onPageInit: function (app, page) {
  }
});

var emailAnonymous = 'anonymous@maisbola.com.br';
var passwordAnonymous = 'anonymous';
var token;

$$(document).on('DOMContentLoaded', function(){
  myApp.showPreloader();
  setTimeout(function(){
    onLogin(emailAnonymous, passwordAnonymous, function(token){
      onLoadSports(token);
      onLoadCities(token);
    }, function(){
      myApp.hidePreloader();
    });
  }, 1000);
});

// Add view
var mainView = myApp.addView('.view-main', {
});

myApp.onPageInit('login-page', function (page) {
  $$('#submmit-login').on('click', function () {
    var email = $$('#email').val();
    var password = $$('#password').val();
    myApp.showPreloader("Bem vindo");
    onLogin(email, password, function(){
      navigatorMenu();
      myApp.hidePreloader();
    }, function(textStatus){
      if(textStatus == '400'){
        myApp.alert('Login foi mal sucedido, tente novamente');
      }else if(textStatus == '500'){
        myApp.alert('Ocorreu um problema no servidor, tente novamente mais tarde');
      }
      myApp.hidePreloader();
    });
  });
});

myApp.onPageInit('signup-page', function (page) {
  $$('#register').on('click', function(){
    var username = $$('#username').val();
    var email = $$('#email').val();
    var password = $$('#password').val();

    if (!username || !password || !email){
      myApp.alert('Por favor, preencha seu nome, endereço de email e senha para se registra');
      return;
    }

    myApp.showPreloader("Registrando");

    var query = 'http://www.maisbola.com.br/api/v1/usuarios/cadastrar';
    var postdata = {};

    postdata.nome = username;
    postdata.email = email;
    postdata.senha = password;
    $$.ajax({
      url: query,
      type: "POST",
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify(postdata),
      statusCode: {
        200: function(data, textStatus) {

          data = JSON.parse(data.response);

          if(data.sucesso == 'ok'){
            onLogin(email, password, function(){
              navigatorMenu();
            }, function(textStatus){
              if(textStatus == '400'){
                myApp.alert('Login foi mal sucedido, tente novamente');
              }else if(textStatus == '500'){
                myApp.alert('Ocorreu um problema no servidor, tente novamente mais tarde');
              }
            });
          }

          myApp.hidePreloader();
        },
        400: function(data, textStatus, jqXHR) {
          myApp.hidePreloader();
          myApp.alert(JSON.parse(data.response).erro);
        },
        500: function(data, textStatus, jqXHR) {
          myApp.hidePreloader();
          myApp.alert('Ocorreu um problema no servidor, tente novamente mais tarde');
        }
      }
    });

  });
});

myApp.onPageInit('filter-page', function (page) {
  var sports = localStorage.getItem("sports");

  if(sports){

    sports = JSON.parse(sports);

    var sportSelected = localStorage.getItem('sportSelected');

    for (i = 0; i < sports.length; i++) {
      var item = sports[i];
      var esporte = item.esporte;
      var piso = item.piso;

      if(!sportSelected && i == 0){
        localStorage.setItem("sportSelected", esporte);
      }

      if(sportSelected == esporte){
        myApp.smartSelectAddOption('.smart-select select#filterSports', '<option selected value="' + item.esporte + '">'+ esporte.capitalize() + ' - ' + piso.capitalize() +'</option>');
      }else{
        myApp.smartSelectAddOption('.smart-select select#filterSports', '<option value="' + item.esporte + '">'+ esporte.capitalize() + ' - ' + piso.capitalize() +'</option>');
      }
    }
  }

  var cities = localStorage.getItem("cities");

  if(cities){

    cities = JSON.parse(cities);
    var citySelected = localStorage.getItem('citySelected');

    for (i = 0; i < cities.length; i++) {
      var item = cities[i];
      var id = item.id;
      var nome = item.nome;
      var uf = item.uf;


      if(!citySelected  && i == 0){
        localStorage.setItem("citySelected", id);
      }

      if(citySelected == id){
        myApp.smartSelectAddOption('.smart-select select#filterCities', '<option selected value="' + id + '">'+ nome + ' - ' + uf +'</option>');
      }else{
        myApp.smartSelectAddOption('.smart-select select#filterCities', '<option value="' + id + '">'+ nome + ' - ' + uf +'</option>');
      }
    }
  }

  $$('.smart-select select#filterSports').on('change', function() {
    setStorageSportSelected(this.value);
  });

  $$('.smart-select select#filterCities').on('change', function() {
    setStorageCitySelected(this.value);
  });

  $$('#action-search').on('click', function(){
    navigatorMenu($$('#filter-name').val());
  });
});

myApp.onPageInit('detail-news-page', function (page) {
   $$('#title').text(page.query.title);
   $$('#summary').html(page.query.summary);
   $$('#image').attr('src', page.query.image);
});

var loadingArenas = false;

myApp.onPageInit('menu-page', function (page) {
  loadingArenas = false;
  localStorage.setItem('pageNumber', 0);
  onLoadArenas(page.query.filterName);

  // Attach 'infinite' event handler
  $$('.infinite-scroll').on('infinite', function () {
    // Exit, if loading in progress
    if (loadingArenas) {
      $$('.infinite-scroll-preloader-arenas').css('display', 'block');
      return;
    }
    onLoadArenas(page.query.filterName);
  }, 1000);

  onLoadNews();

  $$('#tab-link-arenas').on('click', function(){
     filterVisibility(true);
  });

  $$('#tab-link-news').on('click', function(){
     filterVisibility(false);
  });
});

function filterVisibility(visibility){
  if(visibility == true){
    $$('#filter a').css('visibility', 'visible');
  }else{
    $$('#filter a').css('visibility', 'hidden');
  }
}

function setStorageNameAndToken(name, token){
  localStorage.setItem("username", name);
  localStorage.setItem("token", token);
}

function navigatorMenu(data){
  if(data){
    mainView.loadPage('pages/menu-page.html?filterName=' + data);
  }else{
    mainView.loadPage('pages/menu-page.html');
  }
}

function navigatorIndex(){
  mainView.loadPage('index.html');
}

function onLogin(email, password, loginSuccess, loginError){
  if (!password || !email){
    myApp.alert('Por favor, preencha seu endereço de email e senha para entrar.');
    return;
  }

  var query = 'http://www.maisbola.com.br/api/v1/usuarios/login';
  var postdata = {};

  postdata.email = email;
  postdata.senha = password;
  $$.ajax({
    url: query,
    type: "POST",
    contentType: "application/json; charset=utf-8",
    data: JSON.stringify(postdata),
    statusCode: {
      200: function(data, textStatus) {
        data = JSON.parse(data.response);
        setStorageNameAndToken(data.nome, data.token);
        loginSuccess(data.token);
      },
      400: function(data, textStatus, jqXHR) {
        loginError('400');
      },
      500: function(data, textStatus, jqXHR) {
        loginError('500');
      }
    }
  });
}

function onLoadSports(token){
  var query = 'http://www.maisbola.com.br/api/v1/centros-esportivos/esportes-pisos?token=' + token;
  $$.ajax({
    url: query,
    type: "GET",
    contentType: "application/json; charset=utf-8",
    statusCode: {
      200: function(data, textStatus) {
        data = JSON.parse(data.response);

        if (data) {
          localStorage.setItem("sports", JSON.stringify(data));
        }

        var sports = localStorage.getItem("sports");

        if(sports){

          sports = JSON.parse(sports);

          var sportSelected = localStorage.getItem('sportSelected');

          for (i = 0; i < sports.length; i++) {
            var item = sports[i];
            var esporte = item.esporte;
            var piso = item.piso;

            if(!sportSelected && i == 0){
              localStorage.setItem("sportSelected", esporte);
            }

            if(sportSelected == esporte){
              myApp.smartSelectAddOption('.smart-select select#sports', '<option selected value="' + item.esporte + '">'+ esporte.capitalize() + ' - ' + piso.capitalize() +'</option>');
            }else{
              myApp.smartSelectAddOption('.smart-select select#sports', '<option value="' + item.esporte + '">'+ esporte.capitalize() + ' - ' + piso.capitalize() +'</option>');
            }
          }
        }

        myApp.hidePreloader();
      },
      400: function(data, textStatus, jqXHR) {
        myApp.hidePreloader();
      },
      500: function(data, textStatus, jqXHR) {
        myApp.hidePreloader();
      }
    }
  });
}

function onLoadCities(token){
  var query = 'http://www.maisbola.com.br/api/v1/centros-esportivos/cidades?token=' + token;
  $$.ajax({
    url: query,
    type: "GET",
    contentType: "application/json; charset=utf-8",
    statusCode: {
      200: function(data, textStatus) {
        data = JSON.parse(data.response);

        if (data) {
          localStorage.setItem("cities", JSON.stringify(data));
        }

        var cities = localStorage.getItem("cities");

        if(cities){

          cities = JSON.parse(cities);
          var citySelected = localStorage.getItem('citySelected');

          for (i = 0; i < cities.length; i++) {
            var item = cities[i];
            var id = item.id;
            var nome = item.nome;
            var uf = item.uf;


            if(!citySelected  && i == 0){
              localStorage.setItem("citySelected", id);
            }

            if(citySelected == id){
              myApp.smartSelectAddOption('.smart-select select#cities', '<option selected value="' + id + '">'+ nome + ' - ' + uf +'</option>');
            }else{
              myApp.smartSelectAddOption('.smart-select select#cities', '<option value="' + id + '">'+ nome + ' - ' + uf +'</option>');
            }
          }
        }
        myApp.hidePreloader();
      },
      400: function(data, textStatus, jqXHR) {
        myApp.hidePreloader();
      },
      500: function(data, textStatus, jqXHR) {
        myApp.hidePreloader();
      }
    }
  });
}

function onLoadArenas(filterName){
  var pToken = localStorage.getItem('token');
  var pEsporte = localStorage.getItem('sportSelected');
  var pIdCidade =  localStorage.getItem('citySelected');

  pPagingPage = (parseInt(localStorage.getItem('pageNumber')) + 1);

  var url = 'http://www.maisbola.com.br/api/v1/centros-esportivos/buscar';
  var query = url + '?token=' + pToken + '&pagingPage=' + pPagingPage + '&pagingNumberPer=10&esporte=' + pEsporte + '&idCidade=' + pIdCidade;

  if(filterName){
    query += '&nome=' + filterName;
  }

  // Set loading flag
  loadingArenas = true;

  $$.ajax({
    url: query,
    type: "GET",
    contentType: "application/json; charset=utf-8",
    statusCode: {
      200: function(data, textStatus) {

        data = JSON.parse(data.response);
        //variavel de controle para saber ja trouxe registro alguma vez,
        //não mostrar a mensagem quando não trouxe mais registro
        var hasResult = 'false';
        if(data && (data.length > 0)){
          hasResult = true;
          var html = '';
          for (i = 0; i < data.length; i++) {
            var item = data[i];

            var valorDaHora;

            if (typeof item.valorDaHora === "undefined"){
              valorDaHora = 0;
            }else{
              valorDaHora = item.valorDaHora;
            }
            var telephones = item.telefones;
            var hasPhone = (telephones.length > 0) ? "block" : "none";
            var locale = item.cidade.nome + '(' + item.cidade.uf + ')';
            var address = item.endereco + ', ' + item.bairro;

            var lat = item.localizacaoLat;
            var lng = item.localizacaoLong;

            var addressDetailArena = "pages/detail-arena-page.html?name=" + item.nome +
                                     "&valueHour=" + valorDaHora +
                                     "&address=" + address +
                                     "&locale=" + locale +
                                     "&latitude=" + lat +
                                     "&longitude=" + lng +
                                     "&image=" + item.imagemDestaque;

            html += '<li>'+
                  	'<a class="item-link item-content" href="'+ encodeURI(addressDetailArena)+'" >'+
                  		'<div class="item-media">'+
                  			'<img src="'+item.imagemDestaque+'" height="100%"/>'+
                  		'</div>'+
                  		'<div class="item-inner">'+
                  			'<div class="item-title">' + item.nome + '</div>'+
                  			'<div class="item-subtitle">' + item.endereco + '</div>'+
                  			'<div class="item-subtitle">Bairro ' + item.bairro + '</div>'+
                  			//'<div class="item-subtitle">' + locale + '</div>'+
                        '<div class="item-subtitle">A partir de R$ ' + valorDaHora + '/por hora</div>'+
                  		'</div>'+
                      '<a id="' + item.id + '" class="call-action" style="display:' + hasPhone + '" onclick="callAction(' + item.id+ ');" data-phone="'+ telephones+'"> '+
                      '<i class="fa fa-phone" aria-hidden="true"/></i>'+
                      '&nbsp;LIGAR&nbsp;'+
                      '</a>'+
                  	'</a>'+
                '</li>';
          }
          // Append new items
          $$('#list-block-arenas ul').append(html);
          localStorage.setItem("pageNumber", pPagingPage);
        }else{
          if(Boolean(hasResult)){
            myApp.detachInfiniteScroll($$('.infinite-scroll'));
            $$('.infinite-scroll-preloader-arenas').remove();
          }else{
            var nodata = '<li class="nodata">Nenhum centro esportivo encontrado!</li>';
            $$('#list-block-arenas ul').append(nodata);
          }
        }
        loadingArenas = false;
        //  myApp.hidePreloader();
      },
      400: function(data, textStatus, jqXHR) {
        //      myApp.hidePreloader();
        loadingArenas = false;
      },
      500: function(data, textStatus, jqXHR) {
        //  myApp.hidePreloader();
        loadingArenas = false;
      }
    }
  });
}

myApp.onPageInit('detail-arena-page', function (page) {
  $$('#nameArena').text(decodeURI(page.query.name));
  $$('#valueHour').text(decodeURI(page.query.valueHour));
  $$('#address').text(decodeURI(page.query.address));
  $$('#locale').text((decodeURI(page.query.locale)));
  $$('#image').attr('src', decodeURI(page.query.image));

  var myLatLng = Helper.converterCoordenadas(decodeURI(page.query.latitude), decodeURI(page.query.longitude));

  var map = $$('#map');

  var maps = new google.maps.Map(document.getElementById('map'), {
    center: myLatLng,
    disableDefaultUI: true,
    zoom: 15
  });

  var marker = new google.maps.Marker({
    position: myLatLng,
    map: maps,
    //icon: image
    title: page.query.name
  });

});

function onLoadNews(){
  var pToken = localStorage.getItem('token');

  var query = 'http://www.maisbola.com.br/api/v1/artigos?token=' + pToken + '&categoria=novidades';

  // Set loading flag
  loadingNews = true;

  $$.ajax({
    url: query,
    type: "GET",
    contentType: "application/json; charset=utf-8",
    statusCode: {
      200: function(data, textStatus) {

        data = JSON.parse(data.response);
        //variavel de controle para saber ja trouxe registro alguma vez,
        //não mostrar a mensagem quando não trouxe mais registro
        var hasResult = 'false';
        if(data && (data.length > 0)){
          hasResult = true;
          var html = '';
          for (i = 0; i < data.length; i++) {
            var item = data[i];
            var d = new Date(item.dataPublicacao);
            var dF = [d.getDate().padLeft(), (d.getMonth()+1).padLeft(), d.getFullYear()].join('/');

            var images = item.imagens;
            var itemMedia;
            if(typeof images != "undefined" && images.length > 0){
              itemMedia = '<img src=' + images[0] + '/>';
            }else{
              itemMedia = '<i class="icon icon-ball"></i>';
            }

            var urlPage = "pages/detail-news-page.html?title=" + item.titulo + "&summary=" + item.resumo + "&image=" + images[0];

            html += '<li>'+
            '<div class="swipeout-content">'+
            '<a href="'+urlPage+'" class="item-content item-link show-news">'+
            '<div class="item-media">' + itemMedia + '</div>'+
            '<div class="item-inner">'+
            '<div class="item-title-row">'+
            '<div class="item-title"></div>'+
            '<div class="item-after">' + dF + '</div>'+
            '</div>'+
            '<div class="item-text">' + item.titulo + '</div>'+
            '</div>'+
            '</a>'+
            '</div>'+
            '</li>';
          }
          // Append new items
          $$('#list-block-news ul').append(html);

        }else{
          if(Boolean(hasResult)){
            myApp.detachInfiniteScroll($$('.infinite-scroll'));
            $$('.infinite-scroll-preloader-news').remove();
          }else{
            var nodata = '<li class="nodata">Nenhum notícia encontrada!</li>';
            $$('#list-block-news ul').append(nodata);
          }
        }
        loadingArenas = false;
        //  myApp.hidePreloader();
      },
      400: function(data, textStatus, jqXHR) {
        //      myApp.hidePreloader();
        loadingArenas = false;
      },
      500: function(data, textStatus, jqXHR) {
        //  myApp.hidePreloader();
        loadingArenas = false;
      }
    }
  });
}

function callAction(id){
  var telephones = $$('#'+ id).data("phone").split(",");
  var buttons = [
    {
      text: 'Telefones',
      label: true
    }
  ];

  for (var i = 0; i < telephones.length; i++) {
    var phone = telephones[i];

    var button = {};
    button.text = phone;
    button.onClick = function () {
      window.location.href="tel://"+this.text;
    }

    buttons.push(button);
  }

  var button = {};
  button.text = 'Cancelar';
  button.color = 'red';
  buttons.push(button);

  myApp.actions(buttons);
}

$$('#signout').on('click', function(){
  myApp.showPreloader("Finalizando");
  myApp.closePanel();
  setTimeout(function () {
    mainView.back();
    localStorage.setItem("pageNumber", 0);
    myApp.hidePreloader();
  }, 1000);
});

$$('#evaluate').on('click', function(){
  var url = 'https://play.google.com/store/apps/details?id=com.android.chrome';
  window.open(url);
});

$$('.smart-select select#sports').on('change', function() {
  setStorageSportSelected(this.value);
});

$$('.smart-select select#cities').on('change', function() {
  setStorageCitySelected(this.value);
});

function setStorageCitySelected(value){
  localStorage.setItem("citySelected", value);
}

function setStorageSportSelected(value){
  localStorage.setItem("sportSelected", value);
}
