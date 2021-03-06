<template>
  <article class="card mb4">
    <div class="card-content">
      <div class="media">
        <div class="media-left">
          <figure class="image is-64x64">
            <img src="@/assets/Avatars/Main.png"/>
          </figure>
        </div>
        <div class="media-content">
          <p class="title is-4 has-text-dark has-text-weight-light">{{ post.creator_name }}</p>
          <p class="subtitle is-6 has-text-grey">{{ creationDate }}</p>
        </div>
        <div class="media-right">
          <b-tooltip 
            label="Markdown view" 
            position="is-bottom"
            animated
            square
          >
            <button class="button is-small mr1" 
              @click="toggleView"
            >
              <b-icon
                icon="markdown"
              >
              </b-icon>
            </button>
          </b-tooltip>
         
          <b-dropdown v-if="owner || admin">
              <button class="button is-small ml1" slot="trigger">
                <b-icon icon="dots-vertical"></b-icon>
              </button>

              <b-dropdown-item @click="deletePrompt">Delete</b-dropdown-item>
              <b-dropdown-item 
                @click="editModalActive = true"
                :disabled="locked"
                v-show="owner"
              >Edit</b-dropdown-item>
              <div v-if="locked">
                <b-dropdown-item :disabled="!admin" @click="unlockPost">Unlock</b-dropdown-item>
              </div>
              <div v-else>
                <b-dropdown-item @click="lockPost">Lock</b-dropdown-item>
              </div>
          </b-dropdown>
        </div>
      </div>

      <div class="content">
        <div v-if="normalView">
          <truncate clamp="..." 
            :length="477" 
            less="Show less"
            :text="post.content"
          ></truncate>
        </div>
        <div v-else>
          <vue-simple-markdown 
            :source="post.content"
          >
          </vue-simple-markdown>
        </div>
      </div>
    </div>

      <div v-if="post.image_file">
        <div class="card-image" @click="isImageModalActive = true">
          <figure class="image">
            <img :src="imageSrc" alt="Post image">
          </figure>
        </div>
      </div>

      <div class="mt3 pr3 pl3">

        <div class="level is-mobile">
          <div class="level-left">
            <button :class="['button', keks.kekGiven ? 'is-dark' : '']" 
              v-on="{click: keks.kekGiven ? unlikePost : likePost}"
            >
              <b-icon icon="thumb-up" size="is-small"></b-icon>
              <span class="ml1">{{ keks.amountOfKeks }}</span>
            </button>

            <button class="ml2 button is-info" 
              :disabled="locked"
              @click="focusComment"
            >
              <b-icon
                icon="forum"
                size="is-small"
              >
              </b-icon>
              <span class="ml1">{{ comments }}</span>
            </button>
          </div>
          <div class="level-right">
            <b-tag 
              type="is-danger"
              v-show="locked"
              size="is-medium"
              class="mr2"
            >Post is locked!</b-tag>
            <b-tag 
              type="is-primary"
              v-show="post.edited === true"
              size="is-medium"
            >Edited</b-tag>
          </div>
        </div>
      </div> 

      <div v-if="this.comments_info.length > 0" class="pr4 pl4">
        <hr/>

        <div v-show="viewMoreComments" class="mb3">
          <div class="level is-mobile">
            <div class="level-left">
              <a @click="getMoreComments">
                View previous comments
              </a>
            </div>

            <div class="level-right f6 has-text-grey">
              {{ comments_info.length }} of {{ post.comments.length }}
            </div>
          </div>
        </div>

        <div v-for="(comment, index) in comments_info" :key="comment.id">
          <Comment 
            :comment="comment" 
            :index="index"
            v-on:deleteComment="deleteComment"
            :postLock="locked"
          />
        </div>

        <hr/>

      </div>

      <div v-show="!locked" class="pr3 pl3 mt3">
        <div class="columns is-mobile">
          <div class="column is-10">
            <b-field>
              <b-input 
                name="comment field"
                type="textarea"
                ref="commentField"
                rows="1"
                maxlength="1500"
                v-model="commentContent"
                v-validate="'max:1500'"
                :placeholder="['Comment on' +' '+ this.post.creator_name + '\'s' + ' post...']"
              ></b-input>
            </b-field>
          </div>

          <div class="column is-2">
            <button class="button is-fullwidth is-small is-info" disabled>
              <b-icon
                icon="image"
              >
              </b-icon>
            </button>

            <button 
              class="button is-fullwidth mt2 is-small is-success"
              @click="validateComment"
            >
              <b-icon
                icon="send"
              >
              </b-icon>
            </button>

          </div>
        </div>

      </div>
      <!-- Main component end -->

      <!-- MODALS -->
      <!-- Image Modal -->
      <b-modal v-if="post.image_file" :active.sync="isImageModalActive">
          <p class="image">
              <img :src="imageSrc">
          </p>
      </b-modal> <!-- Image Modal end-->

      <!-- Edit Modal -->
      <b-modal 
        :active.sync="editModalActive" 
        :width="640" 
        scroll="keep" 
        :onCancel="resetEdit"
        :canCancel="['x']"
      >
        <article class="card">
          <div class="card-content">
            <div class="media">
              <div class="media-left">
                <figure class="image is-48x48">
                  <img src="https://api.adorable.io/avatars/64/abott@adorable.png"/>
                </figure>
              </div>
              <div class="media-content">
                <p class="title is-4 has-text-dark has-text-weight-light">{{ post.creator_name }}</p>
                <p class="subtitle is-6 has-text-grey">{{ creationDate }}</p>
              </div>
              <div class="media-right">
                <button class="button is-small mr1">
                  <b-icon icon="markdown"></b-icon>
                </button>
                <button class="button is-small ml1">
                  <b-icon icon="dots-vertical"></b-icon>
                </button>
              </div>
            </div>

            <div class="content">
              <truncate clamp="..." 
                :length="477" 
                less="Show less"
                :text="editPost"
              ></truncate>
            </div>

            <b-field label="Edit post"
              :type="errors.has('editpost') ? 'is-danger' : ''"
              :message="errors.has('editpost') ? errors.first('editpost') : ''"
            >
              <b-input 
                name="editpost"
                type="textarea" 
                maxlength="1500" 
                rows="1"
                v-model="editPost"
                v-validate="'max:1500'"
              ></b-input>
            </b-field>
          </div>
        </article>
        <footer class="modal-card-foot">
          <button class="button is-primary" @click="updatePost">Update</button>
        </footer>
      </b-modal> <!-- Edit Modal end -->

  </article>
</template>

<script>
import moment from "moment";
import truncate from "vue-truncate-collapsed";
import axios from "axios";
import { mapState } from "vuex";
import Comment from "@/components/PostStuff/CommentReply/Comment";

export default {
  name: "Post",
  props: ["post", "index"],
  computed: {
    ...mapState(["backendUrl"])
  },
  data() {
    return {
      keks: {
        kekGiven: false,
        amountOfKeks: 0
      },
      comments: 0,
      isImageModalActive: false,
      creationDate: "",
      imageSrc: "",
      owner: false,
      admin: false,
      normalView: true,
      editModalActive: false,
      editPost: this.post.content,
      edited: false,
      locked: false,
      comments_info: [],
      commentContent: "",
      commentAmount: 5,
      viewMoreComments: false
    };
  },
  components: {
    truncate,
    Comment
  },
  created() {
    this.amountOfKeks();
    this.amountOfComments();
    this.getImageUrl();
    this.checkEdit();
    this.prettifyDate();
    this.checkOwner();
    this.checkStatus();
  },
  methods: {
    checkOwner() {
      // Get current user
      let currentuser = JSON.parse(localStorage.getItem("currentuser"));
      if (this.post.creator_name === currentuser.username) {
        this.owner = true;
      } else if (currentuser.roles != null && currentuser.roles[0] === 1) {
        // This is a client side validation,
        this.admin = true;
      }
    },
    likePost() {
      axios
        .post(this.backendUrl + "/post/" + this.post.id + "/like", null, {
          headers: {
            Authorization: "Bearer " + localStorage.access_token
          }
        })
        .then(response => {
          if (response.status === 201) {
            this.keks.kekGiven = true;
            this.keks.amountOfKeks = this.keks.amountOfKeks + 1;
          }
        })
        .catch(error => {
          if (error.response.status === 500) {
            this.$emit(
              "toastMsg",
              "Something went wrong during the process",
              "is-danger"
            );
          }
        });
    },
    unlikePost() {
      axios
        .delete(this.backendUrl + "/post/" + this.post.id + "/like", {
          headers: {
            Authorization: "Bearer " + localStorage.access_token
          }
        })
        .then(response => {
          if (response.status === 200) {
            this.keks.kekGiven = false;
            this.keks.amountOfKeks = this.keks.amountOfKeks - 1;
          }
        })
        .catch(error => {
          if (error.response.status === 500) {
            this.$emit(
              "toastMsg",
              "Something went wrong during the process",
              "is-danger"
            );
          }
        });
    },
    deletePrompt() {
      this.$dialog.confirm({
        title: "Deleting Post",
        message: "Are you sure you want to delete this post?",
        confirmText: "Delete",
        cancelText: "Cancel",
        type: "is-danger",
        hasIcon: true,
        onConfirm: () => this.deletePost()
      });
    },
    resetEdit() {
      this.editPost = this.post.content;
      this.edited = true;
      this.editModalActive = false;
    },
    updatePost() {
      axios
        .put(
          this.backendUrl + "/post/" + this.post.id,
          {
            content: this.editPost
          },
          {
            headers: {
              Authorization: "Bearer " + localStorage.access_token
            }
          }
        )
        .then(response => {
          if (response.status === 200) {
            this.editModalActive = false;
            this.post.content = this.editPost;
            this.$emit(
              "toastMsg",
              "Post has successfully been updated",
              "is-success"
            );
          }
        })
        .catch(error => {
          if (error.response.data.reason === "locked") {
            this.$emit("toastMsg", "This post is locked!", "is-danger");
          } else if (error.response.data.reason === "permission") {
            this.$emit("toastMsg", "You do not own this post!", "is-danger");
          }
        });
    },
    lockPost() {
      axios
        .put(
          this.backendUrl + "/post/" + this.post.id + "/lock",
          {
            method: "lock"
          },
          {
            headers: {
              Authorization: "Bearer " + localStorage.access_token
            }
          }
        )
        .then(response => {
          if (response.status === 200) {
            this.locked = true;
            this.$emit("toastMsg", "Post has been locked!", "is-warning");
          }
        })
        .catch(error => {
          if (error.response.data.reason === "locked") {
            this.$emit("toastMsg", "Post has already been locked.", "is-info");
          } else if (error.response.data.reason === "owner") {
            this.$emit("toastMsg", "You do not have permissions.", "is-danger");
          } else {
            this.$emit(
              "toastMsg",
              "OwO, pwease wait, that was off..",
              "is-danger"
            );
          }
        });
    },
    unlockPost() {
      axios
        .put(
          this.backendUrl + "/post/" + this.post.id + "/lock",
          {
            method: "unlock"
          },
          {
            headers: {
              Authorization: "Bearer " + localStorage.access_token
            }
          }
        )
        .then(response => {
          if (response.status === 200) {
            this.locked = false;
            this.$emit("toastMsg", "Post has been unlocked!", "is-success");
          }
        })
        .catch(error => {
          if (error.response.status === 500) {
            this.$emit(
              "toastMsg",
              "Something went wrong during the proccess",
              "is-danger"
            );
          }
        });
    },
    getInitialComments() {
      this.comments_info = this.post.initial_comments.reverse();
    },
    getMoreComments() {
      if (this.post.comments.length !== this.comments_info.length) {
        let sortedCommentIds = this.post.comments.sort((a, b) => {
          return b - a;
        });
        axios
          .post(
            this.backendUrl + "/postcomments",
            {
              comment_ids: sortedCommentIds.slice(
                this.commentAmount,
                this.commentAmount + 5
              )
            },
            {
              headers: {
                Authorization: "Bearer " + localStorage.access_token
              }
            }
          )
          .then(response => {
            if (response.status === 200) {
              let comments = response.data.comments;
              for (var i = 0; i < comments.length; i++) {
                this.comments_info.unshift(comments[i]);
              }
              this.commentAmount =
                this.commentAmount + response.data.comments.length;
            }
          })
          .catch(error => {
            if (error.response.status === 500) {
              this.$emit(
                "toastMsg",
                "Something went wrong during the process",
                "is-danger"
              );
            }
          })
          .then(() => {
            if (this.post.comments.length === this.comments_info.length) {
              this.viewMoreComments = false;
            }
          });
      } else {
        this.viewMoreComments = false;
      }
    },
    commentOnPost() {
      axios
        .post(
          this.backendUrl + "/post/" + this.post.id + "/comments",
          {
            content: this.commentContent
          },
          {
            headers: {
              Authorization: "Bearer " + localStorage.access_token
            }
          }
        )
        .then(response => {
          if (response.status === 200) {
            // Add the comment
            let new_comment = response.data.new_comment;
            this.comments = this.comments + 1;
            this.comments_info.push(new_comment);
          }
        })
        .catch(error => {
          if (error.response.status === 403) {
            this.$emit("toastMsg", "Post is locked!", "is-danger");
          }
        });
    },
    getImageUrl() {
      if (this.post.image_url) {
        this.imageSrc = this.backendUrl + "/" + this.post.image_url;
      }
    },
    deleteComment(commentId, commentIndex) {
      axios
        .delete(this.backendUrl + "/post/comment/" + commentId, {
          headers: {
            Authorization: "Bearer " + localStorage.access_token
          }
        })
        .then(response => {
          if (response.status === 200) {
            this.comments_info.splice(commentIndex, 1);
            this.comments = this.comments - 1;
            this.$emit("toastMsg", "Comment deleted!", "is-warning");
          }
        })
        .catch(error => {
          if (error.response.status === 404) {
            this.toast("404: Comment not found!", "is-danger");
          } else if (error.response.status === 403) {
            this.toast("You do not own this comment...", "is-danger");
          } else {
            this.toast("Something went wrong during the process", "is-danger");
          }
        });
    },
    // Short functions
    validateComment() {
      if (this.commentContent !== "") {
        this.commentOnPost();
        this.commentContent = "";
      } else {
        this.$refs.commentField.focus();
      }
    },
    amountOfComments() {
      this.comments = this.post.comments.length;
      if (this.post.comments.length > 0) {
        this.getInitialComments();
        if (this.post.comments.length > 5) this.viewMoreComments = true;
      }
    },
    deletePost() {
      this.$emit("deletePost", this.post.id, this.index);
    },
    toggleView() {
      this.normalView = !this.normalView;
    },
    checkEdit() {
      if (this.post.edited === true) {
        this.edited = true;
      }
    },
    checkStatus() {
      if (this.post.status.toLowerCase() === "locked") {
        this.locked = true;
      }
    },
    amountOfKeks() {
      // Check if the user liked the post
      if (this.post.liked === true) {
        this.keks.kekGiven = true;
      }
      this.keks.amountOfKeks = this.post.likes.length;
    },
    prettifyDate() {
      let prettyDate = moment(this.post.created).format("MMM Do, h:MM A");
      this.creationDate = prettyDate;
    },
    focusComment() {
      this.$refs.commentField.focus();
    }
  }
};
</script>
