describe('lodash orderBy function', () => {
  const users = [
    { 'user': 'fred',   'age': 48 },
    { 'user': 'barney', 'age': 36 },
    { 'user': 'fred',   'age': 40 },
    { 'user': 'barney', 'age': 34 }
  ];

  test('should order by a single property', () => {
    const result = _.orderBy(users, ['user'], ['asc']);
    expect(result[0].user).toEqual('barney');
    expect(result[1].user).toEqual('barney');
    expect(result[2].user).toEqual('fred');
    expect(result[3].user).toEqual('fred');
  });

  test('should order by a single property in descending order', () => {
    const result = _.orderBy(users, ['user'], ['desc']);
    expect(result[0].user).toEqual('fred');
    expect(result[1].user).toEqual('fred');
    expect(result[2].user).toEqual('barney');
    expect(result[3].user).toEqual('barney');
  });

  test('should order by multiple properties', () => {
    const result = _.orderBy(users, ['user', 'age'], ['asc', 'desc']);
    expect(result[0]).toEqual({ 'user': 'barney', 'age': 36 });
    expect(result[1]).toEqual({ 'user': 'barney', 'age': 34 });
    expect(result[2]).toEqual({ 'user': 'fred', 'age': 48 });
    expect(result[3]).toEqual({ 'user': 'fred', 'age': 40 });
  });

  test('should order using a function', () => {
    const result = _.orderBy(users, [user => user.age], ['asc']);
    expect(result[0].age).toEqual(34);
    expect(result[1].age).toEqual(36);
    expect(result[2].age).toEqual(40);
    expect(result[3].age).toEqual(48);
  });
});
