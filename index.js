const { ApolloServer, gql } = require('apollo-server')
const { ApolloServerPluginLandingPageGraphQLPlayground } = require('apollo-server-core')
const { users, events, locations, participants } = require('./data.json')

const typeDefs = gql`
  # User
  type User {
    id: ID!
    username: String!
    email: String!
    events: [Event!]
  }

  input CreateUserInput {
    username: String!
    email: String!
  }

  input UpdateUserInput {
    username: String
    email: String
  }

  # Event
  type Event {
    id: ID!
    title: String!
    desc: String
    date: String
    from: String
    to: String
    location_id: ID!
    location: Location!
    user_id: ID!
    user: User!
    participants: [Participant!]
  }

  input CreateEventInput {
    title: String!
    desc: String
    date: String
    from: String
    to: String
    location_id: ID!
    user_id: ID!
  }

  input UpdateEventInput {
    title: String
    desc: String
    date: String
    from: String
    to: String
    location_id: ID
    user_id: ID
  }

  # Location
  type Location {
    id: ID!
    name: String!
    desc: String
    lat: Float
    lng: Float
  }

  input CreateLocationInput {
    name: String!
    desc: String
    lat: Float
    lng: Float
  }

  input UpdateLocationInput {
    name: String
    desc: String
    lat: Float
    lng: Float
  }

  # Participant
  type Participant {
    id: ID!
    user_id: ID!
    event_id: ID!
  }

  input CreateParticipantInput {
    user_id: ID!
    event_id: ID!
  }

  input UpdateParticipantInput {
    user_id: ID
    event_id: ID
  }

  type DeleteAllOutput {
    count: Int!
  }

  type Query {
    user(id: ID!): User!
    users: [User!]

    event(id: ID!): Event!
    events: [Event!]

    location(id: ID!): Location!
    locations: [Location!]

    participant(id: ID!): Participant!
    participants: [Participant!]
  }

  type Mutation {
    # User
    createUser(data: CreateUserInput!): User!
    updateUser(id: ID!, data: UpdateUserInput!): User!
    deleteUser(id: ID!): User!
    deleteAllUsers: DeleteAllOutput!

    # Event
    createEvent(data: CreateEventInput!): Event!
    updateEvent(id: ID!, data: UpdateEventInput!): Event!
    deleteEvent(id: ID!): Event!
    deleteAllEvents: DeleteAllOutput!

    # Location
    createLocation(data: CreateLocationInput!): Location!
    updateLocation(id: ID!, data: UpdateLocationInput!): Location!
    deleteLocation(id: ID!): Location!
    deleteAllLocations: DeleteAllOutput!

    # Participant
    createParticipant(data: CreateParticipantInput!): Participant!
    updateParticipant(id: ID!, data: UpdateParticipantInput!): Participant!
    deleteParticipant(id: ID!): Participant!
    deleteAllParticipants: DeleteAllOutput!
  }
`

// Mutation Helpers
const createMutation = (arr, data) => {
  const user = { id: arr.length + 1, ...data }
  arr.push(user)
  return user
}
const updateMutation = (arr, id, data) => {
  const index = arr.findIndex((u) => u.id === Number(id))
  if (index === -1) throw new Error('Not found')

  const updatedUser = (arr[index] = { ...arr[index], ...data })
  return updatedUser
}
const deleteMutation = (arr, id) => {
  const index = arr.findIndex((u) => u.id === Number(id))
  if (index === -1) throw new Error('Not found')

  const deletedUser = arr.splice(index, 1)[0]
  return deletedUser
}
const deleteAllMutation = (arr) => {
  const count = arr.length
  arr.splice(0, count)
  return { count }
}

const resolvers = {
  Query: {
    user: (_, args) => users.find((u) => u.id === Number(args.id)),
    users: () => users,

    event: (_, args) => events.find((e) => e.id === Number(args.id)),
    events: () => events,

    location: (_, args) => locations.find((l) => l.id === Number(args.id)),
    locations: () => locations,

    participant: (_, args) => participants.find((p) => p.id === Number(args.id)),
    participants: () => participants
  },

  Mutation: {
    // User
    createUser: (_, { data }) => createMutation(users, data),
    updateUser: (_, { id, data }) => updateMutation(users, id, data),
    deleteUser: (_, { id }) => deleteMutation(users, id),
    deleteAllUsers: () => deleteAllMutation(users),

    // Event
    createEvent: (_, { data }) => createMutation(events, data),
    updateEvent: (_, { id, data }) => updateMutation(events, id, data),
    deleteEvent: (_, { id }) => deleteMutation(events, id),
    deleteAllEvents: () => deleteAllMutation(events),

    // Location
    createLocation: (_, { data }) => createMutation(locations, data),
    updateLocation: (_, { id, data }) => updateMutation(locations, id, data),
    deleteLocation: (_, { id }) => deleteMutation(locations, id),
    deleteAllLocations: () => deleteAllMutation(locations),

    // Participant
    createParticipant: (_, { data }) => createMutation(participants, data),
    updateParticipant: (_, { id, data }) => updateMutation(participants, id, data),
    deleteParticipant: (_, { id }) => deleteMutation(participants, id),
    deleteAllParticipants: () => deleteAllMutation(participants)
  },

  User: {
    events: (parent) => events.filter((e) => e.user_id === parent.id)
  },

  Event: {
    location: (parent) => locations.find((l) => l.id === parent.location_id),
    user: (parent) => users.find((u) => u.id === parent.user_id),
    participants: (parent) => participants.filter((p) => p.event_id === parent.id)
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground({})]
})

const port = process.env.PORT || 3000
server.listen(port, () => console.log(`Listening on port ${port}`))
