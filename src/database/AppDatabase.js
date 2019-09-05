import { SQLite } from 'expo-sqlite';

const db = SQLite.openDatabase("ant_voices.db, 0.1");

export const createDatabase = () => {
    db.transaction(tx => {

        /* db.transaction(tx => {
            tx.executeSql(
            "drop table Posts"
            );
        }); 

        db.transaction(tx => {
            tx.executeSql(
            "drop table TopicComments"
            );
        }); */

        tx.executeSql(
          "create table if not exists Posts ("+
              "id integer primary key not null, "+
              "summary text, "+
              "filename text, "+
              "duration integer)"
        );
        tx.executeSql(
            "create table if not exists TopicComments ("+
                "topic_id integer not null, "+
                "comment_id integer, "+
                "primary key (topic_id, comment_id));",
            (t, result) => {
                /* console.log("ResultSet: "+JSON.stringify(result)); */
            },
            (t, error) => {
                /* console.log(error); */
            });
      });
      
      console.log('Creating database..')
}

export const addPost = (summary, filename, duration) => {

    return new Promise((resolve, reject) => db.transaction(
        tx => {
          tx.executeSql("insert into Posts (summary, filename, duration) values (?, ?, ?)", [summary, filename, duration],
          (_, { insertId }) => {
            resolve(insertId)
            console.log('Added Post! '+JSON.stringify(insertId))
          });

          tx.executeSql("select * from Posts", [], 
          (_, { rows }) =>
            console.log('All Posts! '+JSON.stringify(rows))
          );
        },
        null,
        null
      ));
    
}

export const addTopicComment = (topicId, commentId) => {
    console.log("topicId: "+topicId)
    console.log("commentId: "+commentId)
    /* commentId = 999 */
    db.transaction(
        tx => {
          tx.executeSql("insert into TopicComments (topic_id, comment_id) values (?, ?)", 
          [topicId, commentId],
          console.log("success"),
          (t, error) => {
            console.log(error);
          });

          tx.executeSql("select * from TopicComments", [], (_, { rows }) =>
            console.log("TopicComments: "+JSON.stringify(rows))
          );
        },
        null,
        null
      );
}

export const getAllTopics = () => {
  return new Promise((resolve, reject) => db.transaction(
        tx => {
            tx.executeSql(
                "select * from Posts inner join TopicComments "+
                "on Posts.id=TopicComments.topic_id and TopicComments.comment_id is null", 
                [], (_, { rows }) => {
                  /* console.log(JSON.stringify(rows)) */
                  resolve(rows._array)
                }
            );
        },
        null,
        null
      ));
}

export const getAllTopicComments = () => {
  return new Promise((resolve, reject) => db.transaction(
        tx => {
            tx.executeSql(
                "select * from TopicComments", 
                [], (_, { rows }) => {
                  console.log(JSON.stringify(rows))
                  resolve(rows._array)
                }
            );
        },
        null,
        null
      ));
}

export const getComments = (topicId) => {
  return new Promise((resolve, reject) => db.transaction(
        tx => {
            tx.executeSql(
              "select id, summary, filename, duration from Posts inner join TopicComments "+
              "on TopicComments.topic_id = ? and TopicComments.comment_id = Posts.id", 
              /* "select * from TopicComments where topic_id = ? and comment_id is not null",  */
              [topicId], (_, { rows }) => {
                console.log("my comments: "+JSON.stringify(rows))
                resolve(rows._array)
              }
            );
        },
        null,
        null
      ));
}