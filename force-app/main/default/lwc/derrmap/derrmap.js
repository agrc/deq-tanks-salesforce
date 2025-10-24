import ID_FIELD from "@salesforce/schema/Case.Id";
import DD_LAT from "@salesforce/schema/Facility__c.Latitude__c";
import DD_LONG from "@salesforce/schema/Facility__c.Longitude__c";
import UTM_X from "@salesforce/schema/Facility__c.UTM_Easting__c";
import UTM_Y from "@salesforce/schema/Facility__c.UTM_Northing__c";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { getRecord, updateRecord } from "lightning/uiRecordApi";
import { api, LightningElement, wire } from "lwc";

export default class DERRMap extends LightningElement {
  utm_x;
  utm_y;
  @api recordId;
  @api isSandbox;
  @api instanceId;
  @api isReadOnly;
  iframeId;
  sampleId = 1234;

  @wire(getRecord, { recordId: "$recordId", fields: [ID_FIELD, UTM_X, UTM_Y] })
  wiredRecord({ error, data }) {
    if (error) {
      let message = "Unknown error";
      if (Array.isArray(error.body)) {
        message = error.body.map((e) => e.message).join(", ");
      } else if (typeof error.body.message === "string") {
        message = error.body.message;
      }
      this.dispatchEvent(
        new ShowToastEvent({
          title: "Error loading contact",
          message,
          variant: "error"
        })
      );
    } else if (data) {
      console.log("salesforce: salesforce data updated", data);
      this.utm_x = data.fields[UTM_X.fieldApiName].value;
      this.utm_y = data.fields[UTM_Y.fieldApiName].value;
    }

    console.log("instance " + this.instanceId);
    console.log("iframe " + this.iframeId);
  }

  get iframeOrigin() {
    return new URL(this.iframeSrc).origin;
  }

  get iframeSrc() {
    console.log("salesforce: isSandbox", this.isSandbox);
    if (this.isSandbox) {
      return `https://tanksmap.dev.utah.gov?embedded=true`; // staging
    } else if (this.isSandbox === false) {
      return `https://tanksmap.deq.utah.gov?embedded=true`; // prod
    }

    return null;
  }

  constructor() {
    console.log("salesforce: constructor");
    super();
    this.iframeId = crypto.randomUUID();
  }

  connectedCallback() {
    console.log("salesforce: connectedCallback");
    window.addEventListener("message", this.receiveMessage);
    console.log("instance " + this.instanceId);
    console.log("iframe " + this.iframeId);
  }

  disconnectedCallback() {
    window.removeEventListener("message", this.receiveMessage);
  }

  receiveMessage = (event) => {
    if (
      event.origin === window.location.origin ||
      event.origin !== this.iframeOrigin
    ) {
      return;
    }

    console.log(
      "salesforce: event from iframe",
      JSON.stringify(event.data, null, 2)
    );

    const { iframeId, data } = event.data;

    if (iframeId !== this.iframeId) {
      console.log("salesforce: iframeId mismatch", iframeId, this.iframeId);
      return;
    }

    if (!data.UTM_X) {
      return;
    }

    const utm_x = data.UTM_X.toString(); // salesforce stores the coordinate fields as strings ¯\_(ツ)_/¯
    const utm_y = data.UTM_Y.toString();
    if (utm_x === this.utm_x && utm_y === this.utm_y) {
      console.log("salesforce: no change in UTM_X or UTM_Y");
      return;
    }

    const fields = {
      [ID_FIELD.fieldApiName]: this.recordId,
      // make sure that the following properties stay in sync with the properties in website/src/utilities/defineLocation.ts
      [UTM_X.fieldApiName]: utm_x,
      [UTM_Y.fieldApiName]: utm_y,
      [DD_LAT.fieldApiName]: data.DD_LAT.toString(),
      [DD_LONG.fieldApiName]: data.DD_LONG.toString()
    };

    updateRecord({ fields })
      .then(() => {
        console.log("salesforce: record updated successfully");
      })
      .catch((error) => {
        console.error(JSON.stringify(error));
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Error updating record",
            message: error.body.message,
            variant: "error"
          })
        );
      });
  };

  sendCoordinatesToIFrame() {
    console.log(`salesforce: sending coordinates to iframe ${this.iframeId}`);

    this.refs.iframe.contentWindow.postMessage(
      {
        data: {
          UTM_X: parseInt(this.utm_x, 10),
          UTM_Y: parseInt(this.utm_y, 10)
        },
        iframeId: this.iframeId
      },
      this.iframeOrigin
    );
  }

  renderedCallback() {
    console.log("salesforce: renderedCallback");
    console.log("instance " + this.instanceId);
    console.log("iframe " + this.iframeId);

    this.refs.iframe.addEventListener("load", () => {
      console.log("salesforce: iframe loaded", this.utm_x, this.utm_y);

      this.sendCoordinatesToIFrame();
    });
  }
}
