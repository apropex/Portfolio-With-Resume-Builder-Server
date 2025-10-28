//

export default function joinString(...params: (string | number)[]): string {
  return params?.join("") ?? "";
}
