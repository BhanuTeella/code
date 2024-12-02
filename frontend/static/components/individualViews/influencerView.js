export default {
    template: `
      <div v-if="influencer">
        <h1>{{ influencer.name }}</h1>
        <img v-if="influencer.picture" :src="'data:image/png;base64,' + influencer.picture" alt="Influencer Picture" class="img-thumbnail">
        <p><strong>Category:</strong> {{ influencer.category }}</p>
        <p><strong>Reach:</strong> {{ influencer.reach }}</p>
        <p v-if="influencer.instagram_url"><a :href="influencer.instagram_url" target="_blank">Instagram</a></p>
        <p v-if="influencer.twitter_url"><a :href="influencer.twitter_url" target="_blank">Twitter</a></p>
        <p v-if="influencer.facebook_url"><a :href="influencer.facebook_url" target="_blank">Facebook</a></p>
        <router-link to="/influencer_management" class="btn btn-primary mt-3">Back to Influencer Management</router-link>
      </div>
      <div v-else>
        <p>Loading...</p>
      </div>
    `,
    data() {
      return {
        influencer: null,
      };
    },
    async created() {
      const id = this.$route.params.id;  // Use the id from the URL
      await this.fetchInfluencer(id);
    },
    methods: {
      async fetchInfluencer(id) {
        try {
          const res = await fetch(`/api/influencer/${id}`, {  // Use id in the API endpoint
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': localStorage.getItem('token'),
            },
          });
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          const data = await res.json();
          this.influencer = data;
        } catch (error) {
          console.error('Error fetching influencer:', error);
          this.influencer = null;
        }
      },
    },
  };
  