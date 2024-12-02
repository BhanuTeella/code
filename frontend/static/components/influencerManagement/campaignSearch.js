export default {
  template: `
    <div>
      <h1>Campaign Management</h1>
      <div class="row mb-3">
        <div class="col-md-6">
          <label for="name-filter" class="form-label">Name:</label>
          <input type="text" id="name-filter" v-model="filters.name" @input="filterCampaigns" class="form-control" placeholder="Search by name">
        </div>
        <div class="col-md-6">
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
              <div class="d-flex justify-content-between">
                <router-link :to="'/campaign/' + campaign.id" class="btn btn-info btn-sm">View</router-link>
              <router-link :to="'/influencer/create-adrequest/campaign/' + campaign.id" class="btn btn-primary btn-sm">Create Adrequest</router-link>
              </div>
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
    filterCampaigns() {
      this.fetchCampaigns();
    },
  },
  mounted() {
    this.fetchCampaigns();
  },
};
