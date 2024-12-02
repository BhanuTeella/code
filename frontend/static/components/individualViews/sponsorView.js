export default {
    template: `
      <div v-if="sponsor">
        <h1>{{ sponsor.company_name }}</h1>
        <p v-if="sponsor.company_logo_blob">
          <img :src="'data:image/png;base64,' + sponsor.company_logo_blob" alt="Company Logo" class="img-thumbnail">
        </p>
        <p><strong>Industry:</strong> {{ sponsor.industry }}</p>
        <p><strong>Company URL:</strong> <a :href="sponsor.company_url" target="_blank">{{ sponsor.company_url }}</a></p>
        <p><strong>Approval Status:</strong> {{ sponsor.approval_status }}</p>
      </div>
      <div v-else>
        <p>Loading...</p>
      </div>
    `,
    data() {
      return {
        sponsor: null,
      };
    },
    async created() {
      const id = this.$route.params.id;
      await this.fetchSponsor(id);
    },
    methods: {
      async fetchSponsor(id) {
        try {
          const res = await fetch(`/api/sponsor/${id}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': localStorage.getItem('token'),
            },
          });
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          const data = await res.json();
          this.sponsor = data;
        } catch (error) {
          console.error('Error fetching sponsor:', error);
          this.sponsor = null;
        }
      },
    },
  };
  