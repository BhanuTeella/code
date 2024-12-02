export default {
  template: `
	<div class="d-flex justify-content-center align-items-center vh-100">
	  <div class="shadow p-5 bg-body rounded">
	  <h2>Delete Account</h2>
	  <div v-if="message" :class="{'alert-success': isSuccess, 'alert-danger': !isSuccess}" class="alert" role="alert">
		{{ message }}
	  </div>
	  <p>Are you sure you want to delete your account? This action cannot be undone.</p>
	  <button @click="deleteAccount" class="btn btn-danger">Delete Account</button>
	  </div>
	</div>
  `,
  data() {
	return {
	  message: '',
	  isSuccess: false,
	};
  },
  methods: {
    deleteAccount() {
        const token = localStorage.getItem('token');
        fetch('/api/auth/delete-account', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': token,
          },
        })
        .then(response => {
          if (response.ok) {
            return response.json();
          }
          throw new Error('Failed to delete account');
        })
        .then(data => {
          this.message = "Account successfully deleted.";
          this.isSuccess = true;
          // Delete token and other user info from local storage
          localStorage.removeItem('token');
            localStorage.removeItem('user_id');
            localStorage.removeItem('role');
            localStorage.removeItem('email');
      
          // Introduce a delay before redirecting
          setTimeout(() => {
            window.location.href = "/";
          }, 2000); // 2000 milliseconds = 2 seconds
        })
        .catch((error) => {
          this.message = error.message;
          this.isSuccess = false;
        });
      },
  },
};