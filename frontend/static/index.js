import router from './components/router.js'
import Navbar from './components/Navbar.js'

router.beforeEach((to, from, next) => {
  const publicPages = ['/login', '/', '/sponsor/register', '/influencer/register']; 
  const authRequired = !publicPages.includes(to.path);
  const loggedIn = localStorage.getItem('token');
  const userRole = localStorage.getItem('role'); 

  if (authRequired && !loggedIn) {
    // Redirect to login if authentication is required
    next('/login'); 
  } else if (to.meta.role && to.meta.role !== userRole) {
    // If route has a role requirement, check if the user matches
    next('/'); // Redirect to home if role doesn't match
  } else {
    next(); // Proceed to the route
  }
});

new Vue({
  el: '#app',
  template: `<div>
  <Navbar :key='has_changed'/>
  <router-view class="m-3"/></div>`,
  router,
  components: {
    Navbar,
  },
  data: {
    has_changed: true,
  },
  watch: {
    $route(to, from) {
      this.has_changed = !this.has_changed
    },
  },
})