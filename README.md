# Minimalistic Petri Net Representation

We propose a very minimalistic way to represent a finite petrinet.

> List of Pairs of Lists of Positive Numbers without gaps:
> `[Transition]` ~ `[(pre,post)]` ~ `[[[n]]]`
> (where `n` is a natural number)

It describes a bi-partite graph, by picking one partition and giving the source and targets of the incoming and outgoing arcs for each node in the partition.

#### Example Net

JS/JSON representation:

```js
{Net: [
    [[0],[1,2]],
    [[1,2],[3]]
]}
```

Inferred partitions:

- two transitions █₀, █₁
- and four places ◯₀ ◯₁ ◯₂ ◯₃.

Inferred net/arcs:

```
            ◯₁
          ↗   ↘
◯₀ ⟶ █₀        █₁ ⟶ ◯₃
          ↘   ↗
            ◯₂
```

## Spec

```
Spec :=
{ Net: [[[nat]]]
, Labels: Labels
}
```
We have seen a `Net:` example above.

Optional labels are defined as follows.

```
Labels := { Place: PlaceLabels, Transition: TransitionLabels, Arc: ArcLabels }
PlaceLabels, TransitionLabels  := { `labelName`: LabelData }
ArcLabels := { `sourceLabelName->targetLabelName`: LabelData }
LabelData := { `nodeId`: {NodeLabelData} }
```

Example:

```js
{ Net: [ [[],[1]], [[1],[2]], [[2],[3]], [[3],[]] ]
, Labels: {
  Transition: {
    effect: {
        1: function () { console.log('hello') },
        2: function () { console.log('world') }
    }
  }
}
```


#### Repeated, with some illustrations

1. Represent a net as a collection of transitions and their arcs.

   ◯→█→◯→█→◯ ⇒ `[` ◯→█₀→◯, ◯→█₁→◯, ◯→█₂→◯ `]`

   The order in which each transition is specified defines it's identifier.

2. Represent a transition as a pair of multisets over places

   ◯→█₀→◯ ⇒ `[` ⊕◯, ⊕◯ `]₀`

   The multisets denote the sources and targets of the incoming and outgoing arcs, respectively. The multiplicity defined the weight of the arcs.

3. A multiset of places is nothing more than a list of place identifiers.

   ⊕◯ ⇒ `[` Identifier `]`

   Since transitions are defined by their array-index (see pt. 1), it seems natural to use positive numbers starting at zero here too.

So:

- `[[[n]]]` just numbers
- `[` `[[0,1], [2]]₀`, `[[2], [3,4]]₁`, ... `]` first index is transition
- `[` `[⊕◯, ⊕◯]₀`, `[⊕◯, ⊕◯]₁`, ... `]` each a pair of multisets
- `[` `◯→█₀→◯`, `◯→█₁→◯`, `◯→█₂→◯` `]` so more like this
- `◯→█→◯→█→◯→█→◯` and when glued together forms a net

#### Some background

A petrinet is a generalization of a statemachine, able to have multiple active states.

###### Categorically representing Petri-nets

It is modelled as a *bi-partite graph*, with the two partitions being:

 1. Places, *possible states* denoted ◯
 2. Transitions, *movement of state*, denoted █

Bi-partite means the arcs only run between the two partitions:

 - state begin **consumed** by a transition ◯→█
 - state begin **produced** by a transition █→◯

- no arcs from transition to transition, █↛█
- or from place to place, ◯↛◯


We have a operator on types `⊕ : Type → Type` that takes a type can creates a [Multiset](https://en.wikipedia.org/wiki/Multiset) over this type; so `⊕ S := S → pos`.

So ⊕◯ is nothing more than a type with which you can pick a selection of places, possibly multiple times for example

{◯₁ ◯₁ ◯₃} would be a multiset `[1,1,3]` 

A petri-net then, can [categorically]() be seen as two types `S` and `T` paired with two functions `pre`, `post` with type `T → ⊗S`

> < S:Type, T:Type, pre:T → ⊗S, post: T → ⊗S >

thus, Vladimiro Sassone (TODO ref).




