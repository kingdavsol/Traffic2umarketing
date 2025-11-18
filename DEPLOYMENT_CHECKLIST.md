# Production Deployment Checklist

## Pre-Deployment
- [ ] All tests passing locally
- [ ] Code review completed
- [ ] Security scan completed (npm audit, OWASP)
- [ ] Database migrations tested
- [ ] Environment variables configured
- [ ] SSL certificates ready
- [ ] DNS records updated
- [ ] CDN configured (if using)
- [ ] Backup system tested
- [ ] Monitoring alerts configured

## Deployment Day
- [ ] Create backup before deployment
- [ ] Deploy to staging first
- [ ] Run smoke tests on staging
- [ ] Get approval for production
- [ ] Schedule maintenance window (optional)
- [ ] Deploy to production
- [ ] Run health checks
- [ ] Monitor logs for errors
- [ ] Monitor CPU/Memory/Disk
- [ ] Monitor error rates

## Post-Deployment
- [ ] Verify all services are running
- [ ] Run full regression tests
- [ ] Check database integrity
- [ ] Verify user authentication
- [ ] Test critical user flows
- [ ] Monitor performance metrics
- [ ] Review application logs
- [ ] Review access logs
- [ ] Document deployment details
- [ ] Notify team of completion
- [ ] Update status page
- [ ] Gather performance baseline

## Rollback Plan (if needed)
- [ ] Have previous version ready
- [ ] Have database backup ready
- [ ] Have rollback procedure documented
- [ ] Test rollback procedure beforehand
- [ ] Prepare rollback communication

## Post-Deployment (24-48 hours)
- [ ] Monitor error rates
- [ ] Check user feedback
- [ ] Verify analytics data
- [ ] Review performance trends
- [ ] Confirm backup integrity
- [ ] Archive logs
