export default {
  template: `
    <div>
      <h1>Influencer Management</h1>
      <div class="row mb-3">
        <div class="col-md-4">
          <label for="name-filter" class="form-label">Name:</label>
          <input type="text" id="name-filter" v-model="filters.name" @input="fetchInfluencers" class="form-control" />
        </div>
        <div class="col-md-4">
          <label for="category-filter" class="form-label">Category:</label>
          <input type="text" id="category-filter" v-model="filters.category" @input="fetchInfluencers" class="form-control" />
        </div>
        <div class="col-md-4">
          <label for="min-reach-filter" class="form-label">Min Reach:</label>
          <input type="number" id="min-reach-filter" v-model.number="filters.min_reach" @input="fetchInfluencers" class="form-control" />
        </div>
        <div class="col-md-4">
          <label for="max-reach-filter" class="form-label">Max Reach:</label>
          <input type="number" id="max-reach-filter" v-model.number="filters.max_reach" @input="fetchInfluencers" class="form-control" />
        </div>
      </div>

      <div class="row">
        <div v-for="influencer in filteredInfluencers" :key="influencer.id" class="col-md-4 mb-4">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">{{ influencer.name }}</h5>
              <p class="card-text"><strong>Category:</strong> {{ influencer.category }}</p>
              <p class="card-text"><strong>Reach:</strong> {{ influencer.reach }}</p>
              <router-link :to="'/influencer/' + influencer.id" class="btn btn-info btn-sm mt-2">View</router-link>
              <!-- Conditionally render the "Create Ad Request" button for sponsors -->
              <router-link v-if="isSponsor" :to="'/sponsor/create-adrequest/influencer/' + influencer.id" class="btn btn-primary btn-sm mt-2 ml-2">Create Ad Request</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      influencers: [],
      filters: {
        name: '',  // Added name filter
        category: '',
        min_reach: null,
        max_reach: null,
      },
      role: localStorage.getItem('role'),  // Get the role from local storage
    };
  },
  computed: {
    filteredInfluencers() {
      return this.influencers;
    },
    isSponsor() {
      return this.role === 'sponsor';  // Check if the user is a sponsor
    },
  },
  methods: {
    async fetchInfluencers() {
      try {
        const params = new URLSearchParams({
          name: this.filters.name,
          category: this.filters.category,
          min_reach: this.filters.min_reach,
          max_reach: this.filters.max_reach,
        }).toString();

        console.log(`Fetching influencers with params: ${params}`);

        const res = await fetch(`/api/influencer?${params}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('token'),
          },
        });

        if (res.ok) {
          const data = await res.json();
          console.log('Fetched influencers:', data);
          this.influencers = data;
        } else {
          console.error('Error fetching influencers:', res.statusText);
        }
      } catch (error) {
        console.error('Error in fetchInfluencers method:', error);
      }
    },
  },
  mounted() {
    this.fetchInfluencers();
  },
};
