export default {
  template: `
    <div>
      <h1>Influencer Management</h1>
      <div class="row mb-3">
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
        <div class="col-md-6 mt-3">
          <label for="flag-status-filter" class="form-label">Flag Status:</label>
          <select id="flag-status-filter" v-model="filters.is_flagged" @change="fetchInfluencers" class="form-select">
            <option value="">All</option>
            <option value="true">Flagged</option>
            <option value="false">Not Flagged</option>
          </select>
        </div>
      </div>

      <div class="row">
        <div v-for="influencer in filteredInfluencers" :key="influencer.id" class="col-md-4 mb-4">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">{{ influencer.name }}</h5>
              <p class="card-text"><strong>Category:</strong> {{ influencer.category }}</p>
              <p class="card-text"><strong>Reach:</strong> {{ influencer.reach }}</p>
              <p class="card-text"><strong>Flag Status:</strong> {{ influencer.is_flagged ? 'Flagged' : 'Not Flagged' }}</p>
              <button @click="toggleFlagInfluencer(influencer.id, influencer.is_flagged)" class="btn btn-warning btn-sm">
                {{ influencer.is_flagged ? 'Unflag' : 'Flag' }}
              </button>
              <router-link :to="'/influencer/' + influencer.id" class="btn btn-info btn-sm mt-2">View</router-link>

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
        category: '',
        min_reach: null,
        max_reach: null,
        is_flagged: '',
      },
    };
  },
  computed: {
    filteredInfluencers() {
      return this.influencers;
    },
  },
  methods: {
    async fetchInfluencers() {
      try {
        const params = new URLSearchParams({
          category: this.filters.category,
          min_reach: this.filters.min_reach,
          max_reach: this.filters.max_reach,
          is_flagged: this.filters.is_flagged,
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
    async toggleFlagInfluencer(id, is_flagged) {
      console.log(`Toggling flag for influencer with id: ${id}, current flag status: ${is_flagged}`);
      await this.updateInfluencerFlag(id, !is_flagged);
    },
    async updateInfluencerFlag(id, is_flagged) {
      console.log(`Updating influencer flag: id=${id}, is_flagged=${is_flagged}`);
      await fetch('/api/admin/influencer/flag', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authentication-Token': localStorage.getItem('token')
        },
        body: JSON.stringify({ id, is_flagged }),
      }).then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      }).then(data => {
        console.log(data);
        this.fetchInfluencers(); // Ensure this is called to update the list
      }).catch(error => {
        console.error('Error updating influencer flag:', error);
      });
    },
  },
  
  mounted() {
    this.fetchInfluencers();
  },
};
