# DEQ Tanks Salesforce Component

This project is a [Salesforce Lightning Web Component](https://developer.salesforce.com/docs/component-library/documentation/en/lwc) that embeds a Firebase web application via an iframe. It also includes a simple `environmentSwitch` component that allows us to switch between the production and development Urls in the iframe.

It is a stripped down version of a [similar component](https://github.com/agrc/deq-spills) used in the DEQ Spills Salesforce instance and references the same firebase web application.

Development Sandbox: <https://utahdeqorg--derrdev.sandbox.lightning.force.com/>

<https://utahdeqorg--derrdev.sandbox.lightning.force.com/lightning/r/Facility__c/a0Ies0000006WjZEAU/view/>

Production Salesforce Instance: <https://utahdeqorg.lightning.force.com/>

Development Model: Org

## Setup

1. Install Salesforce CLI (`pnpm install -g @salesforce/cli`)
1. Install [Salesforce Extension Pack for VS Code](https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode)
1. Authorize Org Sandbox
   1. `sf org:login:web --alias utahdeqorg --instance-url https://utahdeqorg--eid.sandbox.my.salesforce.com/ --set-default`

## Pulling Changes from Org

`sf project retrieve start --source-dir force-app`

## Pushing Changes to Org

`sf project deploy start --source-dir force-app`

## References

- [Salesforce Extensions Documentation](https://developer.salesforce.com/tools/vscode/)
- [Salesforce CLI Setup Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_intro.htm)
- [Salesforce DX Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_intro.htm)
- [Salesforce CLI Command Reference](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference.htm)
