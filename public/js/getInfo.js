
let client_info = {}

client_info['lenguaje'] = navigator.language
client_info['lenguajes'] = navigator.languages
client_info['info-navegador'] = navigator.userAgentData
client_info['nucleo'] = navigator.hardwareConcurrency
client_info['enlinea'] = navigator.onLine
client_info['memoria'] = navigator.deviceMemory
client_info['plataforma'] = navigator.platform
client_info['appVersion'] = navigator.appVersion

navigator.geolocation.getCurrentPosition(function(pos){
  const crd = pos.coords;
  let obj = {}

  obj['latitud'] = crd.latitude
  obj['longitud'] = crd.longitude
  obj['metros'] = crd.accuracy

  return client_info['direccionActual'] = obj
});


export default client_info