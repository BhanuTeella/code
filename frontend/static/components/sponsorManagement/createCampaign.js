export default {
  template: `
    <div class="container-fluid mt-5 d-flex flex-column align-items-center">
      <div class="col-12 col-md-6">
        <h1 class="text-center mb-4">Create Campaign</h1>
        <p v-if="message" :class="{'text-success': isSuccess, 'text-danger': !isSuccess}">{{ message }}</p>
        <form @submit.prevent="createCampaign">
          <div class="mb-3">
            <label for="campaign-name" class="form-label">Campaign Name</label>
            <input type="text" class="form-control" id="campaign-name" v-model="campaign.name" required>
          </div>
          <div class="mb-3">
            <label for="campaign-description" class="form-label">Description</label>
            <textarea class="form-control" id="campaign-description" v-model="campaign.description"></textarea>
          </div>
          <div class="mb-3">
            <label for="campaign-start-date" class="form-label">Start Date</label>
            <input type="date" class="form-control" id="campaign-start-date" v-model="campaign.start_date" required>
          </div>
          <div class="mb-3">
            <label for="campaign-end-date" class="form-label">End Date</label>
            <input type="date" class="form-control" id="campaign-end-date" v-model="campaign.end_date">
            <p v-if="endDateBeforeStartDate" class="text-danger">End date must be after the start date.</p>
          </div>
          <div class="mb-3">
            <label for="campaign-budget" class="form-label">Budget</label>
            <input type="number" class="form-control" id="campaign-budget" v-model="campaign.budget" required>
          </div>
          <div class="mb-3">
            <label for="campaign-visibility" class="form-label">Visibility</label>
            <select class="form-control" id="campaign-visibility" v-model="campaign.visibility">
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
          <div class="mb-3">
            <label for="campaign-goals" class="form-label">Goals</label>
            <textarea class="form-control" id="campaign-goals" v-model="campaign.goals"></textarea>
          </div>
          <div class="d-flex justify-content-end">
            <button type="submit" class="btn btn-primary" :disabled="!isFormValid">Create Campaign</button>
          </div>
        </form>
      </div>
    </div>
  `,
  data() {
    return {
      campaign: {
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        budget: '',
        visibility: 'public',
        goals: '',
        sponsor_id: ''
      },
      message: '',
      isSuccess: false
    };
  },
  computed: {
    sponsorId() {
      return localStorage.getItem('user_id'); // Assuming the sponsor's ID is stored in localStorage
    },
    endDateBeforeStartDate() {
      const startDate = new Date(this.campaign.start_date);
      const endDate = new Date(this.campaign.end_date);
      return this.campaign.end_date && endDate <= startDate;
    },
    isFormValid() {
      return (
        this.campaign.name &&
        this.campaign.start_date &&
        this.campaign.budget &&
        (!this.campaign.end_date || !this.endDateBeforeStartDate) // Ensure end date is valid if provided
      );
    }
  },
  methods: {
    async createCampaign() {
      if (!this.isFormValid) {
        this.message = "Please fill in all required fields correctly.";
        this.isSuccess = false;
        return;
      }

      this.campaign.sponsor_id = this.sponsorId;

      try {
        const response = await fetch('/api/sponsor/campaigns', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('token')
          },
          body: JSON.stringify(this.campaign)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error creating campaign');
        }

        const data = await response.json();
        this.message = data.message;
        this.isSuccess = true;
        this.resetForm();

      } catch (error) {
        this.message = error.message;
        this.isSuccess = false;
        console.error('Error creating campaign:', error);
      }
    },
    resetForm() {
      this.campaign = {
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        budget: '',
        visibility: 'public',
        goals: '',
        sponsor_id: this.sponsorId
      };
    }
  },
  mounted() {
    if (!this.sponsorId) {
      this.message = 'Sponsor ID not found. Please log in again.';
      this.isSuccess = false;
    } else {
      this.campaign.sponsor_id = this.sponsorId;
    }
  }
};
