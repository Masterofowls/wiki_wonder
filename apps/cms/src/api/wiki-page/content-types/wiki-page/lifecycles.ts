import { extractSlug, notifyWikiRevalidate } from "../../../../utils/revalidate-wiki";

export default {
  async afterCreate(event) {
    await notifyWikiRevalidate(extractSlug(event.result));
  },

  async afterUpdate(event) {
    await notifyWikiRevalidate(extractSlug(event.result));
  },

  async afterDelete(event) {
    await notifyWikiRevalidate(extractSlug(event.result));
  },

  async afterPublish(event) {
    await notifyWikiRevalidate(extractSlug(event.result));
  },

  async afterUnpublish(event) {
    await notifyWikiRevalidate(extractSlug(event.result));
  },
};
