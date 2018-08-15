import Vue from "vue";
import "./plugins/vuetify";
import "./plugins/simplemarkdown";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import ReadMore from "vue-read-more";

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");

Vue.use(ReadMore);
