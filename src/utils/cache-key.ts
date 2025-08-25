/**
 * Utility class for generating consistent cache keys with project prefix
 */
export class CacheKeyBuilder {
  private static readonly PROJECT_PREFIX = 'boiler';

  /**
   * Build a cache key with project prefix
   * @param service - The service name (e.g., 'user', 'order')
   * @param type - The type of data (e.g., 'id', 'email', 'token')
   * @param identifier - The unique identifier
   * @returns Formatted cache key: "boiler:service:type:identifier"
   */
  static build(service: string, type: string, identifier: string): string {
    return `${this.PROJECT_PREFIX}:${service}:${type}:${identifier}`;
  }

  /**
   * Build a cache key for user-related data
   * @param type - The type of identifier ('id' or 'email')
   * @param identifier - The user identifier
   * @returns Formatted cache key: "boiler:user:type:identifier"
   */
  static user(type: 'id' | 'email', identifier: string): string {
    return this.build('user', type, identifier);
  }

  /**
   * Build a cache key for session-related data
   * @param sessionId - The session identifier
   * @returns Formatted cache key: "boiler:session:id:sessionId"
   */
  static session(sessionId: string): string {
    return this.build('session', 'id', sessionId);
  }

  /**
   * Build a cache key for temporary tokens
   * @param tokenType - The type of token ('reset', 'verify', 'access')
   * @param identifier - The token identifier
   * @returns Formatted cache key: "boiler:token:type:identifier"
   */
  static token(tokenType: 'reset' | 'verify' | 'access', identifier: string): string {
    return this.build('token', tokenType, identifier);
  }

  /**
   * Get the project prefix
   * @returns The project prefix used in all cache keys
   */
  static getProjectPrefix(): string {
    return this.PROJECT_PREFIX;
  }
}