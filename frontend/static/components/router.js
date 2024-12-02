import Home from './Home.js';
import Login from './AuthManagement/Login.js';
import changePassword from './AuthManagement/changePassword.js';
import deleteAccount from './AuthManagement/deleteAccount.js';

import sponsorHome from './sponsorManagement/sponsorHome.js';
import sponsorRegisteration from './sponsorManagement/sponsorRegisteration.js';
import sponsorProfile from './sponsorManagement/sponsorProfile.js';
import sponsorCampaigns from './sponsorManagement/sponsorCampaigns.js';
import createCampaign from './sponsorManagement/createCampaign.js';
import sponsorCampaignView from './sponsorManagement/sponsorCampaignView.js';
import sponsorcreateAdRequest from './sponsorManagement/createAdRequest.js';
import influencerSearch from './sponsorManagement/influencerSearch.js';

import influencerHome from './influencerManagement/influencerHome.js';
import influencerRegisteration from './influencerManagement/influencerRegisteration.js';
import influencerProfile from './influencerManagement/influencerProfile.js';
import campaignSearch from './influencerManagement/campaignSearch.js';
import influencercreateAdRequest from './influencerManagement/createAdrequest.js';
import adrequestManagement from './influencerManagement/adrequestManagement.js';

import adminSponsor from './adminManagement/adminSponsor.js';
import adminInfluencer from './adminManagement/adminInfluencer.js';
import adminCampaign from './adminManagement/adminCampaign.js';
import adminHome from './adminManagement/adminHome.js';

import influencerView from './individualViews/influencerView.js';
import sponsorView from './individualViews/sponsorView.js';
import campaignView from './individualViews/campaignView.js';
import adrequestView from './individualViews/adrequestView.js';


const routes = [
  { path: '/', component: Home, name: 'Home'},
  { path: '/login', component: Login, name: 'Login' },
  {path: '/change-password', component: changePassword, name: 'ChangePassword'},
  {path: '/delete-profile', component: deleteAccount, name: 'DeleteAccount'},

  {path: '/sponsor/home', component: sponsorHome, name: 'SponsorHome'},
  {path: '/sponsor/register', component: sponsorRegisteration, name: 'SponsorRegisteration'},
  {path: '/sponsor/profile', component: sponsorProfile, name: 'SponsorProfile'},  
  {path: '/sponsor/create-campaign', component: createCampaign, name: 'CreateCampaign'},
  {path: '/sponsor/campaigns', component: sponsorCampaigns, name: 'SponsorCampaigns'},
  {path: '/sponsor/campaign/:id', component: sponsorCampaignView, name: 'sponsorCampaignView'},
  {path: '/sponsor/create-adrequest/influencer/:id', component: sponsorcreateAdRequest, name: 'sponsorcreateAdRequest'},
  {path: '/influencers', component: influencerSearch, name: 'influencerSearch'},

  {path: '/influencer/home', component: influencerHome, name: 'InfluencerHome'},
  {path: '/influencer/register', component: influencerRegisteration, name: 'InfluencerRegisteration'},
  {path: '/influencer/profile', component: influencerProfile, name: 'InfluencerProfile'},
  {path: '/campaigns', component: campaignSearch, name: 'campaignSearch'},
  {path: '/influencer/create-adrequest/campaign/:campaignId', component: influencercreateAdRequest, name: 'influencercreateAdRequest'},
  {path: '/influencer/adrequests', component: adrequestManagement, name: 'adrequestManagement'},

  {path: '/admin/sponsor-management', component: adminSponsor, name: 'AdminSponsor'},
  {path: '/admin/influencer-management', component: adminInfluencer, name: 'AdminInfluencer'},
  {path: '/admin/campaign-management', component: adminCampaign, name: 'AdminCampaign'},
  {path: '/admin/home', component: adminHome, name: 'AdminHome'},

  
  {path: '/influencer/:id', component: influencerView, name: 'InfluencerView'},
  {path: '/sponsor/:id', component: sponsorView, name: 'SponsorView'},
  {path: '/campaign/:id', component: campaignView, name: 'CampaignView'},
  {path: '/adrequest/:id', component: adrequestView, name: 'AdRequestView'},
  
]

export default new VueRouter({
  routes,
})
