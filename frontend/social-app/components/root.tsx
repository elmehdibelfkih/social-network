// import React from "react";

type RootMessage = {
    name: string;
}

export default function Root({ name }: RootMessage) {
    return (
        <h1>{name}</h1>
    )
}