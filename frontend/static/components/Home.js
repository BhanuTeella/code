export default {
  template: `
  <div class="container mt-5">
    <h1 class="text-center mb-4">Welcome to the Influencer Engagement & Sponsorship Coordination Platform</h1>
    <p class="text-center mb-5">Connect sponsors and influencers to create impactful campaigns.</p>
    <div class="row">
      <div class="col-md-6">
        <h2 class="mb-3">For Sponsors</h2>
        <p>Reach a wider audience and grow your brand by connecting with influential creators.</p>
        <router-link to="/sponsor/register" class="btn btn-primary">Join Now</router-link>
      </div>
      <div class="col-md-6">
        <h2 class="mb-3">For Influencers</h2>
        <p>Collaborate with brands, expand your reach, and monetize your content.</p>
        <router-link to="/influencer/register" class="btn btn-primary">Join Now</router-link>
      </div>
    </div>
  </div>
`,
};