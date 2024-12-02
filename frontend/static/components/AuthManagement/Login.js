export default {
    template: `
      <div class="d-flex justify-content-center align-items-center vh-100">
        <div class="shadow p-5 bg-body rounded">
          <div v-if="error" class="alert alert-danger" role="alert">
            {{ error }}
          </div>
          <div class="mb-3">
            <label for="user-email" class="form-label"><i class="bi bi-envelope-fill"></i> Email address</label>
            <input type="email" class="form-control" id="user-email" placeholder="name@example.com" v-model="cred.email">
          </div>
          <div class="mb-3">
            <label for="user-password" class="form-label"><i class="bi bi-lock-fill"></i> Password</label>
            <input type="password" class="form-control" id="user-password" v-model="cred.password">
          </div>
          <button class="btn btn-primary w-100 mt-2" @click="login">Login</button>
        </div>
      </div>
    `,
    data() {
      return {
        cred: {
          email: null,
          password: null,
        },
        error: null,
      };
    },
    methods: {
      async login() {
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(this.cred),
          });
          const data = await res.json();
          if (res.ok) {
            localStorage.setItem('user_id', data.id);
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            localStorage.setItem('email', data.email);
  
            // Redirect based on role
            if (data.role === 'admin') {
              this.$router.push({ path: '/admin/home' });
            } else if (data.role === 'influencer') {
              this.$router.push({ path: '/influencer/home' });
            } else if (data.role === 'sponsor') {
              this.$router.push({ path: '/sponsor/home' }); 
            } else {
              this.$router.push({ path: '/' }); 
            }
          } else {
            this.error = data.message;
          }
        } catch (error) {
          console.error("Error during login:", error);
          this.error = "An error occurred during login.";
        }
      },
    },
  };