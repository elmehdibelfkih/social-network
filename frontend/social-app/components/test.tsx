import styles from "@/styles/components/test.module.css"

type RootMessage = {
    name: string;
}

export default function TestComponent({ name }: RootMessage) {
    return (
        <h1 className={styles.test}>{name}</h1>
    )
}