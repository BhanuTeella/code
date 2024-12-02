export default {
  template: `
    <div>
      <h1>Campaign Management</h1>
      <div class="row mb-3">
        <div class="col-md-3">
          <label for="name-filter" class="form-label">Name:</label>
          <input type="text" id="name-filter" v-model="filters.name" @input="filterCampaigns" class="form-control" placeholder="Search by name">
        </div>
        <div class="col-md-3">
          <label for="visibility-filter" class="form-label">Visibility:</label>
          <select id="visibility-filter" v-model="filters.visibility" @change="filterCampaigns" class="form-select">
            <option value="">All</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>
        <div class="col-md-3">
          <label for="flag-status-filter" class="form-label">Flag Status:</label>
          <select id="flag-status-filter" v-model="filters.is_flagged" @change="filterCampaigns" class="form-select">
            <option value="">All</option>
            <option value="true">Flagged</option>
            <option value="false">Not Flagged</option>
          </select>
        </div>
        <div class="col-md-3">
          <label for="budget-filter" class="form-label">Budget Range:</label>
          <div class="input-group">
            <input type="number" v-model="filters.min_budget" @input="filterCampaigns" class="form-control" placeholder="Min">
            <input type="number" v-model="filters.max_budget" @input="filterCampaigns" class="form-control" placeholder="Max">
          </div>
        </div>
      </div>
      <div class="row">
        <div v-for="campaign in filteredCampaigns" :key="campaign.id" class="col-md-4 mb-4">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">{{ campaign.name }}</h5>
              <p class="card-text">{{ campaign.description }}</p>
              <p class="card-text"><strong>Start Date:</strong> {{ campaign.start_date }}</p>
              <p class="card-text"><strong>End Date:</strong> {{ campaign.end_date || 'Ongoing' }}</p>
              <p class="card-text"><strong>Budget:</strong> {{ campaign.budget }}</p>
              <p class="card-text"><strong>Visibility:</strong> {{ campaign.visibility }}</p>
              <p class="card-text"><strong>Flag Status:</strong> {{ campaign.is_flagged ? 'Flagged' : 'Not Flagged' }}</p>
              <button @click="toggleFlagCampaign(campaign.id, campaign.is_flagged)" class="btn btn-warning btn-sm">
                {{ campaign.is_flagged ? 'Unflag' : 'Flag' }}
              </button>
              <router-link :to="'/campaign/' + campaign.id" class="btn btn-info btn-sm mt-2">View</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      campaigns: [],
      filters: {
        name: '',
        visibility: '',
        is_flagged: '',
        min_budget: '',
        max_budget: ''
      },
    };
  },
  computed: {
    filteredCampaigns() {
      return this.campaigns.filter(campaign => {
        return (
          (this.filters.name === '' || campaign.name.toLowerCase().includes(this.filters.name.toLowerCase())) &&
          (this.filters.visibility === '' || campaign.visibility === this.filters.visibility) &&
          (this.filters.is_flagged === '' || campaign.is_flagged.toString() === this.filters.is_flagged) &&
          (this.filters.min_budget === '' || campaign.budget >= this.filters.min_budget) &&
          (this.filters.max_budget === '' || campaign.budget <= this.filters.max_budget)
        );
      });
    },
  },
  methods: {
    async fetchCampaigns() {
      const queryParams = new URLSearchParams(this.filters).toString();
      const res = await fetch(`/api/sponsor/campaignsearch?${queryParams}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authentication-Token': localStorage.getItem('token'),
        },
      });
      const data = await res.json();
      this.campaigns = data;
    },
    async toggleFlagCampaign(campaign_id, is_flagged) {
      console.log(`Toggling flag for campaign with id: ${campaign_id}, current flag status: ${is_flagged}`);
      await fetch(`/api/admin/campaign/flag`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authentication-Token': localStorage.getItem('token'),
        },
        body: JSON.stringify({ campaign_id, is_flagged: !is_flagged }),
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          console.log(data);
          this.fetchCampaigns();
        })
        .catch(error => {
          console.error('Error updating campaign flag:', error);
        });
    },
    filterCampaigns() {
      this.fetchCampaigns();
    },
  },
  mounted() {
    this.fetchCampaigns();
  },
};
