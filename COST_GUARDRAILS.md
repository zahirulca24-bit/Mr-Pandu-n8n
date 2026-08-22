# Cost Guardrails — $0 Target

## Locked target

Use only:

- one `e2-micro` VM in a Google Cloud Compute Engine Free Tier eligible US region (`us-west1`, `us-central1`, or `us-east1`),
- no more than `30 GB-months` of `pd-standard`,
- one external IPv6 allocation assigned to the VM,
- **no external IPv4 address**,
- low outbound traffic appropriate for light office automation.

Google Cloud's current VPC pricing states that external IPv6 ranges assigned to subnets and external IPv6 addresses assigned to VM instances are not charged. The plan therefore removes the continuously billed external IPv4 address from the design.

## $0 is a target, not a blank cheque

The deployment must remain within Google Cloud's current Free Tier usage limits. Data transfer, additional resources, future pricing changes, taxes, or usage outside free allowances can create charges.

Before deployment, Antigravity must check the current Google Cloud pricing/free-tier page and stop if the selected configuration no longer fits the $0 target.

## Never create without explicit owner approval

- external IPv4 address
- Cloud NAT / NAT64
- Cloud Router solely for NAT
- Cloud SQL
- load balancer
- paid VM types
- balanced/SSD disks
- additional VMs
- GPUs/TPUs
- managed Kubernetes
- paid backup products
- paid DNS zone

## Network rule

The public n8n endpoint is IPv6-only under this plan. If a client/provider is IPv4-only, that is a **compatibility failure**, not permission to create a paid workaround.

## Deployment safety

Before creating resources, Antigravity must:

1. show the selected Project ID,
2. show the chosen region/zone, machine type, disk type/size, and networking,
3. explicitly show `External IPv4: NONE`,
4. show the planned external IPv6 configuration,
5. check for existing resources with the same names,
6. avoid deleting or modifying unrelated resources,
7. confirm that no Cloud NAT, load balancer, Cloud SQL, or paid disk is being created,
8. state the expected recurring infrastructure cost as `$0 target within Free Tier limits`,
9. stop if the requested configuration is outside these guardrails.
